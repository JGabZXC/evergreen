import mongoose from "mongoose";
import { Section } from "../../../domain/Section";
import { SectionModel } from "../../../infrastructure/database/SectionModel";
import { SectionDTO } from "../../../interfaces/http/types/SectionDTO";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class UpdateSectionUseCase {
  async execute(
    id: string,
    data: Partial<Section>,
    session?: mongoose.ClientSession
  ) {
    try {
      return await SectionModel.findByIdAndUpdate(id, data, {
        new: true,
        session: session || null,
      }).lean<SectionDTO>();
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
