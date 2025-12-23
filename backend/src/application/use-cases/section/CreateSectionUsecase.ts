import mongoose from "mongoose";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";
import { BaseSection } from "../../../domain/Section";
import { SectionModel } from "../../../infrastructure/database/SectionModel";
import { SectionValidationService } from "../../services/SectionValidationService";

export class CreateSectionUseCase {
  private validationService: SectionValidationService;

  constructor() {
    this.validationService = new SectionValidationService();
  }

  async execute(data: BaseSection, session?: mongoose.ClientSession) {
    // Check for Room Conflict
    if (data.designatedRoom) {
      await this.validationService.validateRoomAvailability(
        data.designatedRoom.toString(),
        data.schoolYear
      );
    }

    // Check for Adviser Conflict
    if (data.adviserId) {
      await this.validationService.validateAdviserAvailability(
        data.adviserId,
        data.schoolYear
      );
    }

    try {
      const newData: Omit<BaseSection, "adviserId"> & {
        adviserId?: string | undefined;
      } = { ...data };
      if (newData.adviserId === "TBA") {
        newData.adviserId = undefined;
      }

      const [createdSection] = await SectionModel.create([newData], {
        session: session || null,
      });
      return createdSection;
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
