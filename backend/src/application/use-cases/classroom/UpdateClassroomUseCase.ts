import mongoose from "mongoose";
import { BaseClassroom } from "../../../domain/Classroom";
import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";
import { ClassroomDTO } from "../../../interfaces/http/types/ClassroomDTO";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class UpdateClassroomUseCase {
  async execute(
    id: string,
    data: Partial<BaseClassroom>,
    session?: mongoose.ClientSession
  ) {
    try {
      return await ClassroomModel.findByIdAndUpdate(id, data, {
        new: true,
        session: session || null,
      }).lean<ClassroomDTO>();
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
