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
      // Strategy:
      // - JHS/SHS (Block): Prefer schedules in the Section's designated room.
      // - College (Flexible): Prefer schedules with capacity (Load Balancing).
      const isCollege = input.gradeLevel.startsWith("COL");

      // Fetch all potential schedules for the subjects to enroll
      const subjectIds = subjectsToEnroll.map((s) => s._id);
      const allSchedules = await SubjectScheduleModel.find({
        subject: { $in: subjectIds },
        semester: input.semester,
        schoolYear: input.schoolYear,
      }).lean();

      // Helper to find the best schedule for a subject
      const findBestSchedule = (subjectId: string) => {
        const candidates = allSchedules.filter(
          (s) => s.subject.toString() === subjectId.toString()
        );

        if (candidates.length === 0) return undefined;
        if (candidates.length === 1) return candidates[0];

        if (!isCollege && section.designatedRoom) {
          // JHS/SHS: Try to find a schedule in the designated room
          const roomMatch = candidates.find((s) =>
            s.schedules.some(
              (slot: any) =>
                slot.room.toString() === section.designatedRoom?.toString()
            )
          );
          if (roomMatch) return roomMatch;
        }

        // Fallback / College: Pick the first one (or implement load balancing here)
        // Ideally, we would check current enrollment counts for each schedule.
        return candidates[0];
      };

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
        const schedule = findBestSchedule(subject._id.toString());
        const scheduleId = schedule ? schedule._id : undefined;

        return {
          studentId: input.studentId,
          subject: subject._id,
          scheduleId: scheduleId,
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
