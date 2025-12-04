import mongoose from "mongoose";
import {
  NotFoundError,
  BadRequestError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { EnrollmentRecordModel } from "../../../infrastructure/database/EnrollmentRecordModel";
import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";
import { EnrollmentStatus } from "../../../domain/EnrollmentRecord";

export class TransferStudentSectionUseCase {
  async execute(input: { studentId: string; newClassroomId: string }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Find active enrollment
      const enrollment = await EnrollmentRecordModel.findOne({
        studentId: input.studentId,
        status: EnrollmentStatus.Enrolled,
      }).session(session);

      if (!enrollment) {
        throw new NotFoundError("Active enrollment not found for student");
      }

      // 2. Find new classroom
      const newClassroom = await ClassroomModel.findById(
        input.newClassroomId
      ).session(session);
      if (!newClassroom) {
        throw new NotFoundError("New classroom not found");
      }

      // Check if new classroom matches grade level
      if (newClassroom.gradeLevel !== enrollment.gradeLevel) {
        throw new BadRequestError(
          "New classroom grade level does not match student's current grade level"
        );
      }

      // Check capacity
      if (newClassroom.currentCapacity >= newClassroom.capacity) {
        throw new BadRequestError("New classroom is full");
      }

      // 3. Find old classroom
      const oldClassroom = await ClassroomModel.findOne({
        gradeLevel: enrollment.gradeLevel,
        name: enrollment.section,
      }).session(session);

      if (!oldClassroom) {
        throw new NotFoundError("Current classroom not found");
      }

      if (oldClassroom._id.toString() === newClassroom._id.toString()) {
        throw new BadRequestError("Student is already in this classroom");
      }

      // 4. Update Enrollment
      await EnrollmentRecordModel.findByIdAndUpdate(
        enrollment._id,
        {
          section: newClassroom.name,
          adviser: newClassroom.adviserId,
        },
        { session }
      );

      // 5. Update Capacities
      await ClassroomModel.findByIdAndUpdate(
        oldClassroom._id,
        { $inc: { currentCapacity: -1 } },
        { session }
      );
      await ClassroomModel.findByIdAndUpdate(
        newClassroom._id,
        { $inc: { currentCapacity: 1 } },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
