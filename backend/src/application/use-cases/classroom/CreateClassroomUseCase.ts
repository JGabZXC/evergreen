import mongoose from "mongoose";
import { BaseClassroom } from "../../../domain/Classroom";
import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";

export class CreateClassroomUseCase {
  async execute(data: BaseClassroom, session?: mongoose.ClientSession) {
    const [createdClassroom] = await ClassroomModel.create([data], {
      session: session || null,
    });
    return createdClassroom;
  }
}
