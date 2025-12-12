import { SectionModel } from "../../../infrastructure/database/SectionModel";
import { SectionDTO } from "../../../interfaces/http/types/SectionDTO";

export class GetAllSectionUseCase {
  async execute(skip: number, limit: number) {
    const [sections, totalDocs] = await Promise.all([
      SectionModel.find().skip(skip).limit(limit).lean<SectionDTO[]>(),
      SectionModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return {
      totalDocs: totalDocs,
      totalPages,
      sections,
    };
  }
}
