import mongoose from "mongoose";
import {
  BaseEnrollmentRecord,
  EnrollmentStatus,
} from "../../../domain/EnrollmentRecord";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { EnrollmentRecordModel } from "../../../infrastructure/database/EnrollmentRecordModel";
import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";
import { CourseModel } from "../../../infrastructure/database/CourseModel";
import { SubjectStatus } from "../../../domain/SubjectTaken";
import { GradeLevel } from "../../../domain/Subject";

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const defaultSchoolYear = `${currentYear}-${nextYear}`;

interface EnrollStudentInput extends BaseEnrollmentRecord {
  courseId?: string;
  creditedSubjects?: string[]; // List of subject IDs to credit
}

export class EnrollStudentUseCase {
  async execute(input: EnrollStudentInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const student = await StudentModel.findOne({
        studentId: input.studentId,
      }).session(session);

      if (!student) {
        throw new NotFoundError("Student not found");
      }

      // 1. Check for existing active enrollment in the same semester/year
      const activeEnrollment = await EnrollmentRecordModel.findOne({
        studentId: input.studentId,
        status: EnrollmentStatus.Enrolled,
        schoolYear: input.schoolYear || defaultSchoolYear,
        semester: input.semester,
      }).session(session);

      if (activeEnrollment) {
        throw new ConflictError(
          "Student is already enrolled for this semester"
        );
      }

      // 2. Check Promotion Eligibility (Requirement 1)
      // Get the latest enrollment record (excluding current attempt)
      const lastEnrollment = await EnrollmentRecordModel.findOne({
        studentId: input.studentId,
        status: {
          $in: [
            EnrollmentStatus.Passed,
            EnrollmentStatus.Failed,
            EnrollmentStatus.Enrolled,
          ],
        }, // Check past records
      })
        .sort({ createdAt: -1 })
        .session(session);

      if (lastEnrollment) {
        // If trying to move up a grade level
        if (this.isHigherGrade(input.gradeLevel, lastEnrollment.gradeLevel)) {
          // Check if any subject was failed in the last enrollment
          const hasFailedSubjects = lastEnrollment.subjectTaken?.some(
            (sub) => sub.status === SubjectStatus.Failed
          );

          if (hasFailedSubjects) {
            throw new BadRequestError(
              "Cannot move to the next grade level due to failed subjects in the previous enrollment."
            );
          }
        }
      }

      // 3. Determine Subjects to Take (Requirement 3)
      let subjectsToTake: any[] = [];

      if (input.courseId) {
        const course = await CourseModel.findById(input.courseId).session(
          session
        );
        if (!course) {
          throw new NotFoundError("Course not found");
        }

        // Find subjects for the requested grade and semester
        const curriculum = course.subjectToBeTaken.find(
          (s) =>
            s.gradeLevel === input.gradeLevel && s.semester === input.semester
        );

        if (curriculum && curriculum.subject) {
          subjectsToTake = curriculum.subject.map((subId) => ({
            subjectId: subId.toString(),
            status: SubjectStatus.Enrolled,
          }));
        } else {
          // If no curriculum found for this grade/sem, maybe throw error or allow empty?
          // Requirement says "no subject should be taken outside their curriculum"
          // If curriculum is empty, they take nothing? Or maybe error.
          // Let's assume if they select a course, they MUST follow it.
          throw new BadRequestError(
            "No curriculum found for this grade level and semester in the selected course."
          );
        }
      }

      // 4. Handle Credited Subjects (Requirement 2)
      // If there are credited subjects, we should probably record them.
      // We can add them to the current enrollment as "Credited" or create a separate record.
      // Given the flow, if a student is a transferee, they might be enrolling in a specific semester
      // and getting credit for others.
      // Let's add them to the `subjectTaken` list if they are NOT already there (avoid duplicates).
      // However, usually credited subjects are from *previous* years/semesters.
      // If we add them here, they appear in this semester's record.
      // A better approach for "Crediting" might be to just ensure they are recorded in the system.
      // For now, I will append them with status 'Credited' so they appear in the record.
      if (input.creditedSubjects && input.creditedSubjects.length > 0) {
        const credited = input.creditedSubjects.map((subId) => ({
          subjectId: subId,
          status: SubjectStatus.Credited,
        }));
        subjectsToTake = [...subjectsToTake, ...credited];
      }

      // 5. Find available classroom (Round Robin / Lowest Capacity)
      const classroom = await ClassroomModel.findOne({
        gradeLevel: input.gradeLevel,
        $expr: { $lt: ["$currentCapacity", "$capacity"] },
      })
        .sort({ currentCapacity: 1 })
        .session(session);

      if (!classroom) {
        throw new BadRequestError(
          `No available classroom for grade ${input.gradeLevel}`
        );
      }

      // 6. Create Enrollment Record
      const enrollment = await EnrollmentRecordModel.create(
        [
          {
            studentId: input.studentId,
            gradeLevel: input.gradeLevel,
            section: classroom.name,
            enrollmentDate: new Date(),
            status: EnrollmentStatus.Enrolled,
            schoolYear: input.schoolYear || defaultSchoolYear,
            adviser: classroom.adviserId,
            semester: input.semester,
            subjectTaken: subjectsToTake,
          },
        ],
        { session }
      );

      // 7. Update Classroom Capacity
      await ClassroomModel.findByIdAndUpdate(
        classroom._id,
        { $inc: { currentCapacity: 1 } },
        { session }
      );

      await session.commitTransaction();
      return enrollment[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private isHigherGrade(newGrade: GradeLevel, oldGrade: GradeLevel): boolean {
    const gradeOrder = Object.values(GradeLevel);
    const newIndex = gradeOrder.indexOf(newGrade);
    const oldIndex = gradeOrder.indexOf(oldGrade);
    return newIndex > oldIndex;
  }
}
