import mongoose from "mongoose";
import { ClassroomModel } from "../../infrastructure/database/ClassroomModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../interfaces/http/middleware/HttpErrors";
import { GradeLevel } from "../../domain/Subject";

export class ClassroomAllocationService {
  async validateManualSelection(
    classroomId: string,
    targetGradeLevel: GradeLevel,
    session: mongoose.ClientSession
  ) {
    const classroom =
      await ClassroomModel.findById(classroomId).session(session);

    if (!classroom) throw new NotFoundError("Classroom not found.");

    if (classroom.currentCapacity >= classroom.capacity) {
      throw new BadRequestError(`Classroom ${classroom.name} is full.`);
    }

    if (classroom.gradeLevel !== targetGradeLevel) {
      throw new BadRequestError(
        `Mismatch: Classroom is ${classroom.gradeLevel}, you are enrolling for ${targetGradeLevel}`
      );
    }

    // Important: We don't increment here. We return the object.
    // The UseCase transaction will perform the atomic increment.
    return classroom;
  }

  async findBestAvailableSection(
    gradeLevel: GradeLevel,
    session: mongoose.ClientSession
  ) {
    // Find section with lowest capacity that isn't full
    const availableSection = await ClassroomModel.findOne({
      gradeLevel: gradeLevel,
      $expr: { $lt: ["$currentCapacity", "$capacity"] },
    })
      .sort({ currentCapacity: 1 }) // Load balancing
      .session(session);

    if (!availableSection) {
      throw new BadRequestError(
        `No available sections found for ${gradeLevel}. Please contact the Registrar.`
      );
    }

    return availableSection;
  }
}
