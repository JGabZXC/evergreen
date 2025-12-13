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
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SectionModel } from "../../../infrastructure/database/SectionModel";
import { StudentAdvisingService } from "../../services/studentAdvisingService";
import { ClassroomAllocationService } from "../../services/classroomAllocationService";
import { Subject } from "../../../domain/Subject";

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
      let section;
      if (input.section) {
        // Manual Selection
        section = await this.allocationService.validateManualSelection(
          input.section.toString(),
          input.gradeLevel
        );
      } else {
        // Automatic / Load Balanced Selection
        const allocationResult =
          await this.allocationService.findBestAvailableSection(
            input.gradeLevel
          );
        section = Array.isArray(allocationResult)
          ? allocationResult[0]
          : allocationResult;
      }

      if (!section) {
        throw new BadRequestError("No suitable section found for enrollment.");
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
      const classSchedules = await SubjectScheduleModel.find({
        semester: input.semester,
        schoolYear: input.schoolYear,
      });

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
            section: section._id,
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
      const subjectTakenDocs = subjectsToEnroll.map((subject: Subject) => {
        const assignedTeacher =
          scheduleMap.get(subject._id.toString()) || "TBA"; // Handle missing schedule safely

        return {
          studentId: input.studentId,
          subject: subject._id,
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

      // 9. Persistence: Update Section Capacity
      // Use atomic increment to ensure thread safety
      await SectionModel.findByIdAndUpdate(
        section._id,
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
