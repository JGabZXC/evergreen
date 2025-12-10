import { SubjectModel } from "../../../infrastructure/database/SubjectModel";
import { SubjectDTO } from "../../../interfaces/http/types/SubjectDTO";

export interface SubjectFilter {
  semester?: number;
  targetGradeLevels?: string;
  active?: boolean;
  subjectId?: string;
}

export class GetAllSubjectUseCase {
  async execute(filter: SubjectFilter, skip: number, limit: number) {
    const query: any = {};

    if (filter.semester !== undefined) {
      query.semesterAvailable = filter.semester;
    }

    if (filter.targetGradeLevels) {
      query.targetGradeLevels = filter.targetGradeLevels;
    }

    if (filter.active !== undefined) {
      query.active = filter.active;
    }

    if (filter.subjectId) {
      query.subjectId = { $regex: filter.subjectId, $options: "i" };
    }

    const [subjects, totalDocs] = await Promise.all([
      SubjectModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("createdBy")
        .lean<SubjectDTO[]>(),
      SubjectModel.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return { totalDocs, totalPages, subjects };
  }
}
