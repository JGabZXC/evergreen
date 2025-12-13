import { SectionModel } from "../../../infrastructure/database/SectionModel";
import { SectionDTO } from "../../../interfaces/http/types/SectionDTO";

export interface FilterSection {
  search?: string;
  gradeLevel?: string;
  schoolYear?: string;
  capacity?: number;
}

export class GetAllSectionUseCase {
  async execute(filter: FilterSection = {}, skip: number, limit: number) {
    const query: Record<string, string | number | Record<string, unknown>> = {};

    if (filter.search) {
      query["name"] = { $regex: filter.search, $options: "i" };
    }

    if (filter.gradeLevel) {
      query["gradeLevel"] = filter.gradeLevel;
    }

    if (filter.schoolYear) {
      query["schoolYear"] = filter.schoolYear;
    }

    if (filter.capacity) {
      query["capacity"] = { $gte: filter.capacity };
    }

    const [sections, totalDocs] = await Promise.all([
      SectionModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("designatedRoom")
        .lean<SectionDTO[]>(),
      SectionModel.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return {
      totalDocs: totalDocs,
      totalPages,
      sections,
    };
  }
}
