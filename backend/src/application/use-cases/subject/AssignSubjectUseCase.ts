import mongoose from "mongoose";
import { SubjectModel } from "../../../infrastructure/database/SubjectModel";
import { SubjectDTO } from "../../../interfaces/http/types/SubjectDTO";

export class AssignSubjectUseCase {
  async execute(
    teacherId: string,
    subjectId: string,
    session?: mongoose.ClientSession
  ) {
    return await SubjectModel.findOneAndUpdate(
      { subjectId },
      { teacherId },
      { new: true, session: session || null }
    )
      .populate("createdBy")
      .lean<SubjectDTO>();
  }
}
