import mongoose from "mongoose";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";
import { BaseSection } from "../../../domain/Section";
import { SectionModel } from "../../../infrastructure/database/SectionModel";

export class CreateSectionUseCase {
  async execute(data: BaseSection, session?: mongoose.ClientSession) {
    try {
      const [createdSection] = await SectionModel.create([data], {
        session: session || null,
      });
      return createdSection;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictError(
          "A section with this adviserId already exists."
        );
      }

      throw err;
    }
  }
}
