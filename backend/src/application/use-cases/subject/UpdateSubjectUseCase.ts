import mongoose from "mongoose";
import { BaseSubject } from "../../../domain/Subject";
import { SubjectModel } from "../../../infrastructure/database/SubjectModel";

export class UpdateSubjectUseCase {
  async execute(
    subjectId: string,
    data: Partial<BaseSubject>,
    session?: mongoose.ClientSession
  ) {
    return await SubjectModel.find({ subjectId }, null, {
      session: session || null,
    }).findOneAndUpdate(data, { new: true });
  }
}
