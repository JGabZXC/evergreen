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

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const defaultSchoolYear = `${currentYear}-${nextYear}`;

export class EnrollStudentUseCase {
  async execute(input: BaseEnrollmentRecord) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const student = await StudentModel.findOne({
        studentId: input.studentId,
      }).session(session);

      if (!student) {
        throw new NotFoundError("Student not found");
      }

      // 2. Check if already enrolled (Active) in the school year
      const activeEnrollment = await EnrollmentRecordModel.findOne({
        studentId: input.studentId,
        status: EnrollmentStatus.Enrolled,
        schoolYear: defaultSchoolYear,
        semester: input.semester,
      }).session(session);

      if (activeEnrollment) {
        throw new ConflictError("Student is already enrolled");
      }

      // 3. Find available classroom (Round Robin / Lowest Capacity)
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

      // 4. Create Enrollment Record
      const enrollment = await EnrollmentRecordModel.create(
        [
          {
            studentId: input.studentId,
            gradeLevel: input.gradeLevel,
            section: classroom.name,
            enrollmentDate: new Date(),
            status: EnrollmentStatus.Enrolled,
            schoolYear: input.schoolYear,
            adviser: classroom.adviserId,
            semester: input.semester,
          },
        ],
        { session }
      );

      // 5. Update Classroom Capacity
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
