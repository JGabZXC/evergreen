import { SubjectModel } from "../../../infrastructure/database/SubjectModel";
import { SubjectDTO } from "../../../interfaces/http/types/SubjectDTO";

export class GetAllSubjectUseCase {
  async execute(skip: number, limit: number) {
    const [subjects, totalDocs] = await Promise.all([
      SubjectModel.find()
        .skip(skip)
        .limit(limit)
        .populate("createdBy")
        .lean<SubjectDTO[]>(),
      SubjectModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return { totalDocs, totalPages, subjects };
  }
}
