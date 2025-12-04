import { SubjectModel } from "../../../infrastructure/database/SubjectModel";

export class GetSubjectUseCase {
  async execute(subjectId: string) {
    const subject = await SubjectModel.findOne({ subjectId });
    return subject;
  }
}
