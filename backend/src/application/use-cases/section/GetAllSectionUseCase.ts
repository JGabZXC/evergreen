import { FilterQuery } from "mongoose";
import { SectionModel } from "../../../infrastructure/database/SectionModel";
import { SectionDTO } from "../../../interfaces/http/types/SectionDTO";

export interface FilterSection {
  search?: string;
  gradeLevel?: string;
  schoolYear?: string;
  capacity?: number;
  adviserId?: string;
}

export class GetAllSectionUseCase {
  async execute(
    filter: FilterQuery<FilterSection> = {},
    skip: number,
    limit: number
  ) {
    const [sections, totalDocs] = await Promise.all([
      SectionModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("designatedRoom")
        .lean<SectionDTO[]>(),
      SectionModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return {
      totalDocs: totalDocs,
      totalPages,
      sections,
    };
  }
}
