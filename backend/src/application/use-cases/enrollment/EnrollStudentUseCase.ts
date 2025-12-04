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

      // 4. Handle Manual/Credited Subjects (Requirement 2)
      // Merge input.subjectTaken with curriculum subjects
      if (input.subjectTaken && input.subjectTaken.length > 0) {
        // Create a map of existing subjects for easy lookup/update
        const subjectMap = new Map(subjectsToTake.map((s) => [s.subjectId, s]));

        for (const sub of input.subjectTaken) {
          if (subjectMap.has(sub.subjectId)) {
            // Update existing subject (e.g. change status to Credited)
            const existing = subjectMap.get(sub.subjectId);
            existing.status = sub.status;
          } else {
            // Add new subject (e.g. extra credited subject)
            subjectsToTake.push({
              subjectId: sub.subjectId,
              status: sub.status,
            });
          }
        }
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
