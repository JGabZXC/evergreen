import mongoose from "mongoose";
import { SubjectModel } from "../../../infrastructure/database/SubjectModel";
import { SubjectDTO } from "../../../interfaces/http/types/SubjectDTO";

export class UpdateSubjectUseCase {
  async execute(
    subjectId: string,
    data: Partial<SubjectDTO>,
    session?: mongoose.ClientSession
  ) {
    return await SubjectModel.findByIdAndUpdate(subjectId, data, {
      new: true,
      session: session || null,
    })
      .populate("createdBy")
      .lean<SubjectDTO>();
  }
}
