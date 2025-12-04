import mongoose from "mongoose";
import {
  BaseEnrollmentRecord,
  EnrollmentStatus,
} from "../../../domain/EnrollmentRecord";
import { SubjectStatus } from "../../../domain/SubjectTaken";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { EnrollmentRecordModel } from "../../../infrastructure/database/EnrollmentRecordModel";
import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";
import { CourseModel } from "../../../infrastructure/database/CourseModel";
import { SubjectModel } from "../../../infrastructure/database/SubjectModel";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";

export class EnrollStudentUseCase {
  async execute(input: BaseEnrollmentRecord) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate Student & Get Assigned Course
      const student = await StudentModel.findOne({
        studentId: input.studentId,
      }).session(session);

      if (!student) {
        throw new NotFoundError("Student not found");
      }

      if (!student.course) {
        throw new BadRequestError(
          "Student has no assigned course/program. Please update student details first."
        );
      }

      // 2. Check for Existing Active Enrollment
      const activeEnrollment = await EnrollmentRecordModel.findOne({
        studentId: input.studentId,
        schoolYear: input.schoolYear,
        semester: input.semester,
        status: { $ne: EnrollmentStatus.Dropped },
      }).session(session);

      if (activeEnrollment) {
        throw new ConflictError(
          "Student is already enrolled for this semester."
        );
      }

      // 3. Validate Classroom (Section)
      if (!input.classroom) {
        throw new BadRequestError("Classroom ID is required.");
      }

      const classroom = await ClassroomModel.findById(input.classroom).session(
        session
      );

      if (!classroom) {
        throw new NotFoundError("Classroom not found.");
      }

      // 3a. Validate Classroom Capacity
      if (classroom.currentCapacity >= classroom.capacity) {
        throw new BadRequestError(`Classroom ${classroom.name} is full.`);
      }

      // 3b. Validate Grade Level Match
      if (classroom.gradeLevel !== input.gradeLevel) {
        throw new BadRequestError(
          `Classroom is for ${classroom.gradeLevel}, but enrollment is for ${input.gradeLevel}`
        );
      }

      // --- CURRICULUM & SUBJECT LOADING LOGIC ---

      // 4. Fetch Course Curriculum based on Student's Assigned Course
      const course = await CourseModel.findById(student.course).session(
        session
      );

      if (!course) {
        throw new NotFoundError("Assigned course curriculum not found.");
      }

      // 5. Get Standard Subjects for this Year & Semester
      const curriculumSubjects = course.subjectToBeTaken.filter(
        (item) =>
          item.gradeLevel === input.gradeLevel &&
          item.semester === input.semester
      );

      const standardSubjectIds = curriculumSubjects.flatMap((c) => c.subject);

      // 6. Fetch Student's Academic History
      const academicHistory = await SubjectTakenModel.find({
        studentId: input.studentId,
      }).session(session);

      const passedSubjectIds = new Set(
        academicHistory
          .filter(
            (h) => h.status === SubjectStatus.Passed || SubjectStatus.Credited
          )
          .map((h) => h.subjectId)
      );

      const failedHistory = academicHistory.filter(
        (h) =>
          (h.status === SubjectStatus.Failed ||
            h.status === SubjectStatus.Dropped) &&
          !passedSubjectIds.has(h.subjectId)
      );

      // 7. Calculate "New" Subjects
      const subjectsToTakeIds = standardSubjectIds.filter(
        (id) => !passedSubjectIds.has(id.toString())
      );

      const newSubjectDetails = await SubjectModel.find({
        _id: { $in: subjectsToTakeIds },
        active: true,
      }).session(session);

      // 8. Calculate "Retake" Subjects
      const potentialRetakeIds = failedHistory.map((h) => h.subjectId);

      const retakeDetails = await SubjectModel.find({
        subjectId: { $in: potentialRetakeIds },
        active: true,
      }).session(session);

      const validRetakes = retakeDetails.filter((sub) =>
        sub.semesterAvailable.includes(input.semester)
      );

      // 9. Finalize Load
      const finalLoadMap = new Map();

      newSubjectDetails.forEach((sub) => {
        finalLoadMap.set(sub.subjectId, { ...sub.toObject(), isRetake: false });
      });

      validRetakes.forEach((sub) => {
        finalLoadMap.set(sub.subjectId, { ...sub.toObject(), isRetake: true });
      });

      // --- PERSISTENCE LAYER ---

      // 10. Create Enrollment Record (Header)
      const [enrollment] = await EnrollmentRecordModel.create(
        [
          {
            studentId: input.studentId,
            classroomId: classroom._id,
            gradeLevel: input.gradeLevel,
            enrollmentDate: new Date(),
            status: EnrollmentStatus.Enrolled,
            schoolYear: input.schoolYear,
            semester: input.semester,
          },
        ],
        { session }
      );

      // 11. Bulk Create SubjectTaken Records (Lines)
      const subjectTakenDocs = Array.from(finalLoadMap.values()).map(
        (subject: any) => ({
          studentId: input.studentId,
          subjectId: subject.subjectId,
          classroomId: classroom._id,
          teacherId: "TBA",
          schoolYear: input.schoolYear,
          semester: input.semester,
          status: SubjectStatus.Enrolled,
          // remarks: subject.isRetake ? "Retake" : "Regular",
          prelim: 0,
          midterm: 0,
          final: 0,
          finalGrade: 0,
        })
      );

      if (subjectTakenDocs.length > 0) {
        await SubjectTakenModel.insertMany(subjectTakenDocs, { session });
      }

      // 12. Update Classroom Capacity
      await ClassroomModel.findByIdAndUpdate(
        classroom._id,
        { $inc: { currentCapacity: 1 } },
        { session }
      );

      await session.commitTransaction();
      return enrollment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
