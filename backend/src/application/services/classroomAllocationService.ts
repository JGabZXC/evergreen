import mongoose from "mongoose";
import { ClassroomModel } from "../../infrastructure/database/ClassroomModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../interfaces/http/middleware/HttpErrors";
import { GradeLevel } from "../../domain/Subject";

export class ClassroomAllocationService {
  /**
   * Validates a manually selected classroom for eligibility.
   */
  async validateManualSelection(
    classroomId: string,
    targetGradeLevel: GradeLevel,
    session?: mongoose.ClientSession
  ) {
    const classroom = await ClassroomModel.findById(classroomId).session(
      session || null
    );

    if (!classroom) {
      throw new NotFoundError("Classroom not found.");
    }

    if (classroom.currentCapacity >= classroom.capacity) {
      throw new BadRequestError(`Classroom ${classroom.name} is full.`);
    }

    if (classroom.gradeLevel !== targetGradeLevel) {
      throw new BadRequestError(
        `Mismatch: Classroom is ${classroom.gradeLevel}, Student is ${targetGradeLevel}`
      );
    }

    return classroom;
  }

  /**
   * Automatically finds the best available section using a load-balancing strategy.
   */
  async findBestAvailableSection(
    gradeLevel: GradeLevel,
    session?: mongoose.ClientSession
  ) {
    // Load Balancing Strategy:
    // Find sections for this Grade Level that are NOT full.
    // Sort by 'currentCapacity' ascending to fill sections evenly (Round Robin effect).
    const availableSections = await ClassroomModel.find({
      gradeLevel: gradeLevel,
      $expr: { $lt: ["$currentCapacity", "$capacity"] },
    })
      .sort({ currentCapacity: 1 })
      .limit(1)
      .session(session || null);

    if (availableSections.length === 0) {
      throw new BadRequestError(
        `No available sections found for ${gradeLevel}. All are full.`
      );
    }

    return availableSections[0];
  }
}
