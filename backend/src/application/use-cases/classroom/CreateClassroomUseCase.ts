import mongoose from "mongoose";
import { BaseClassroom } from "../../../domain/Classroom";
import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class CreateClassroomUseCase {
  async execute(data: BaseClassroom, session?: mongoose.ClientSession) {
    try {
      const [createdClassroom] = await ClassroomModel.create([data], {
        session: session || null,
      });
      return createdClassroom;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictError(
          "A classroom with this adviserId already exists."
        );
      }

      throw err;
    }
  }
}
