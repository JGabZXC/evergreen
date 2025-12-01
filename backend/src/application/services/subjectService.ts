import mongoose from "mongoose";
import { BaseSubject } from "../../domain/Subject";
import { SubjectModel } from "../../infrastructure/database/SubjectModel";

export class SubjectService {
  async createSubject(
    details: BaseSubject,
    createdBy: string,
    session?: mongoose.ClientSession
  ) {
    return SubjectModel.create(
      [
        {
          ...details,
          createdBy,
        },
      ],
      { session }
    );
  }
}
