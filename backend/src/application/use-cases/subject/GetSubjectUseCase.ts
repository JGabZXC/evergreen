import { SubjectModel } from "../../../infrastructure/database/SubjectModel";
import { SubjectDTO } from "../../../interfaces/http/types/SubjectDTO";

export class GetSubjectUseCase {
  async execute(subjectId: string) {
    const subject = await SubjectModel.findOne({ subjectId })
      .populate("createdBy")
      .lean<SubjectDTO>();
    return subject;
  }
}
