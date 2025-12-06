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

      // 3. Delegate: Allocation Service (Find Classroom)
      let classroom;
      if (input.classroom) {
        classroom = await this.allocationService.validateManualSelection(
          input.classroom.toString(),
          input.gradeLevel,
          session
        );
      } else {
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

      // 4. Delegate: Advising Service (Determine Subjects)
      const subjectsToEnroll = await this.advisingService.determineStudentLoad(
        input.studentId,
        student.course.toString(),
        input.gradeLevel,
        input.semester,
        session
      );

      // 5. Fetch Schedule for Teacher Mapping (Persistence Detail)
      // This maps the Advising result (Subjects) to the Allocation result (Classroom Schedule)
      const classSchedules = await ClassScheduleModel.find({
        classroomId: classroom._id,
        semester: input.semester,
        schoolYear: input.schoolYear,
      }).session(session);

      const scheduleMap = new Map<string, string>();
      classSchedules.forEach((sched) => {
        scheduleMap.set(sched.subjectId, sched.teacherId);
      });

      // 6. Persistence: Create Enrollment Record (Header)
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

      // 7. Persistence: Bulk Create SubjectTaken Records (Lines)
      const subjectTakenDocs = subjectsToEnroll.map((subject: any) => {
        const assignedTeacher = scheduleMap.get(subject.subjectId) || "TBA";

        return {
          studentId: input.studentId,
          subjectId: subject.subjectId,
          classroomId: classroom._id,
          teacherId: assignedTeacher,
          schoolYear: input.schoolYear,
          semester: input.semester,
          status: SubjectStatus.Enrolled,
          prelim: 0,
          midterm: 0,
          final: 0,
          finalGrade: 0,
        };
      });

      if (subjectTakenDocs.length > 0) {
        await SubjectTakenModel.insertMany(subjectTakenDocs, { session });
      }

      // 8. Persistence: Update Classroom Capacity
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
