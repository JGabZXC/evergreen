import mongoose from "mongoose";
import { BaseClassroom } from "../../../domain/Classroom";
import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";
import { ClassroomDTO } from "../../../interfaces/http/types/ClassroomDTO";

export class UpdateClassroomUseCase {
  async execute(
    id: string,
    data: Partial<BaseClassroom>,
    session?: mongoose.ClientSession
  ) {
    return await ClassroomModel.findByIdAndUpdate(id, data, {
      new: true,
      session: session || null,
    }).lean<ClassroomDTO>();
  }
}
