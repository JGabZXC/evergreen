import mongoose from "mongoose";
import { Section } from "../../../domain/Section";
import { SectionModel } from "../../../infrastructure/database/SectionModel";
import { SectionDTO } from "../../../interfaces/http/types/SectionDTO";
import {
  ConflictError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { SectionValidationService } from "../../services/SectionValidationService";

export class UpdateSectionUseCase {
  private validationService: SectionValidationService;

  constructor() {
    this.validationService = new SectionValidationService();
  }

  async execute(
    id: string,
    data: Partial<Section>,
    session?: mongoose.ClientSession
  ) {
    const currentSection = await SectionModel.findById(id);
    if (!currentSection) {
      throw new NotFoundError("Section not found");
    }

    const targetSchoolYear = data.schoolYear || currentSection.schoolYear;

    // Check for Adviser Conflict
    if (data.adviserId && data.adviserId !== currentSection.adviserId) {
      await this.validationService.validateAdviserAvailability(
        data.adviserId,
        targetSchoolYear,
        id
      );
    }

    // Check for Room Conflict
    if (
      data.designatedRoom &&
      data.designatedRoom.toString() !==
        currentSection.designatedRoom?.toString()
    ) {
      await this.validationService.validateRoomAvailability(
        data.designatedRoom.toString(),
        targetSchoolYear,
        id
      );
    }

    try {
      // Prepare update operation
      let updateOp: any = { ...data };

      // If adviserId is "TBA", unset it to avoid unique index conflict on "TBA" string
      // and to properly represent "no adviser"
      if (data.adviserId === "TBA") {
        delete updateOp.adviserId;
        updateOp.$unset = { adviserId: 1 };
      }

      return await SectionModel.findByIdAndUpdate(id, updateOp, {
        new: true,
        session: session || null,
      }).lean<SectionDTO>();
    } catch (err: any) {
      if (err.code === 11000) {
        if (err.keyPattern?.adviserId) {
          throw new ConflictError(
            "Teacher is already an adviser for this school year."
          );
        }
        if (err.keyPattern?.designatedRoom) {
          throw new ConflictError(
            "Room is already occupied for this school year."
          );
        }
        throw new ConflictError(
          "Section with this name already exists in this grade level and school year."
        );
      }
      throw err;
    }
  }
}
