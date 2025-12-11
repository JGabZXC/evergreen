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
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { ClassScheduleModel } from "../../../infrastructure/database/ClassScheduleModel";
import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";
import { StudentAdvisingService } from "../../services/studentAdvisingService";
import { ClassroomAllocationService } from "../../services/classroomAllocationService";

export class EnrollStudentUseCase {
  private advisingService = new StudentAdvisingService();
  private allocationService = new ClassroomAllocationService();

  async execute(input: BaseEnrollmentRecord) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch Student & Validate Existence
      const student = await StudentModel.findOne({
        studentId: input.studentId,
      }).session(session);

      if (!student) {
        throw new NotFoundError("Student not found");
      }

      if (!student.course) {
        throw new BadRequestError(
          "Student has no assigned course. Please update student profile first."
        );
      }

      // 2. Validate Promotion Eligibility
      // Checks if student passed previous year (skipped if COL-1)
      await this.advisingService.validatePromotionEligibility(
        input.studentId,
        student.course.toString(),
        input.gradeLevel
      );

      // 3. Check for Duplicate Active Enrollment
      const activeEnrollment = await EnrollmentRecordModel.findOne({
        studentId: input.studentId,
        schoolYear: input.schoolYear,
        semester: input.semester,
        status: { $ne: EnrollmentStatus.Dropped },
      }).session(session);

      if (activeEnrollment) {
        throw new ConflictError(
          `Student is already enrolled for ${input.schoolYear} - ${input.semester}.`
        );
      }

      // 4. REQ 4: Delegate Classroom Allocation
      let classroom;
      if (input.classroom) {
        // Manual Selection
        classroom = await this.allocationService.validateManualSelection(
          input.classroom.toString(),
          input.gradeLevel,
          session
        );
      } else {
        // Automatic / Load Balanced Selection
        classroom = await this.allocationService.findBestAvailableSection(
          input.gradeLevel,
          session
        );
      }

      if (!classroom) {
        throw new BadRequestError(
          "No suitable classroom found for enrollment."
        );
      }

      // 5. Delegate: Advising (Determine Subjects)
      const subjectsToEnroll = await this.advisingService.determineStudentLoad(
        input.studentId,
        student.course.toString(),
        input.gradeLevel,
        input.semester,
        session
      );

      if (subjectsToEnroll.length === 0) {
        // Edge case: Student passed everything or credited everything
        throw new BadRequestError(
          "No subjects left to enroll for this semester. Student may be fully credited or finished."
        );
      }

      // 6. Fetch Schedule for Teacher Mapping
      const classSchedules = await ClassScheduleModel.find({
        classroomId: classroom._id,
        semester: input.semester,
        schoolYear: input.schoolYear,
      }).session(session);

      // Map SubjectID -> TeacherID
      const scheduleMap = new Map<string, string>();
      classSchedules.forEach((sched) => {
        scheduleMap.set(sched.subject.toString(), sched.teacherId);
      });

      // 7. Persistence: Create Enrollment Record
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

      // 8. Persistence: Bulk Create SubjectTaken Records
      const subjectTakenDocs = subjectsToEnroll.map((subject: any) => {
        const assignedTeacher =
          scheduleMap.get(subject._id.toString()) || "TBA"; // Handle missing schedule safely

        return {
          studentId: input.studentId,
          subject: subject._id,
          classroomId: classroom._id,
          teacherId: assignedTeacher,
          schoolYear: input.schoolYear,
          semester: input.semester,
          status: SubjectStatus.Ongoing,
          prelim: 0,
          midterm: 0,
          final: 0,
          finalGrade: 0,
        };
      });

      if (subjectTakenDocs.length > 0) {
        await SubjectTakenModel.insertMany(subjectTakenDocs, { session });
      }

      // 9. Persistence: Update Classroom Capacity
      // Use atomic increment to ensure thread safety
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
