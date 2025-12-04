import { SubjectModel } from "../../../infrastructure/database/SubjectModel";

export class GetAllSubjectUseCase {
  async execute(skip: number, limit: number) {
    const [subjects, totalDocs] = await Promise.all([
      SubjectModel.find().skip(skip).limit(limit),
      SubjectModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return { totalDocs, totalPages, subjects };
  }
}
