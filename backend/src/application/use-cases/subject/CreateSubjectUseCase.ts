import mongoose from "mongoose";
import { BaseSubject, Subject } from "../../../domain/Subject";
import { SubjectModel } from "../../../infrastructure/database/SubjectModel";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class CreateSubjectUseCase {
  async execute(
    details: BaseSubject,
    createdBy: string,
    session?: mongoose.ClientSession
  ): Promise<Subject> {
    try {
      const [subject] = await SubjectModel.create(
        [
          {
            ...details,
            createdBy,
          },
        ],
        { session }
      );

      if (!subject) {
        throw new Error("Failed to create subject");
      }

      return subject;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictError("Subject ID already exists", err.keyValue);
      }
      throw err;
    }
  }
}
