import { SectionModel } from "../../infrastructure/database/SectionModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../interfaces/http/middleware/HttpErrors";
import { GradeLevel } from "../../domain/types/GradeLevel";
import { SectionDTO } from "../../interfaces/http/types/SectionDTO";

export class ClassroomAllocationService {
  async validateManualSelection(
    classroomId: string,
    targetGradeLevel: GradeLevel
  ) {
    const classroom =
      await SectionModel.findById<SectionDTO>(classroomId).populate(
        "designatedRoom"
      );

    if (!classroom) throw new NotFoundError("Section not found.");

    if (classroom.currentCapacity >= classroom.designatedRoom?.capacity!) {
      throw new BadRequestError(
        `Room ${classroom.designatedRoom?.name} is full.`
      );
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

  async findBestAvailableSection(gradeLevel: GradeLevel) {
    // Find section with lowest capacity that isn't full

    const availableSection = await SectionModel.aggregate([
      {
        $match: {
          gradeLevel: gradeLevel,
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "designatedRoom",
          foreignField: "_id",
          as: "designatedRoom",
        },
      },
      {
        $unwind: "$designatedRoom",
      },
      {
        $match: {
          $expr: { $lt: ["$currentCapacity", "$designatedRoom.capacity"] },
        },
      },
      {
        $limit: 1,
      },
      { $sort: { currentCapacity: 1 } },
    ]);

    if (!availableSection) {
      throw new BadRequestError(
        `No available sections found for ${gradeLevel}. Please contact the Registrar.`
      );
    }

    return availableSection;
  }
}
