import mongoose from "mongoose";
import { BaseCourse } from "../../../domain/Course";
import { CourseDTO } from "../../../interfaces/http/types/CourseDTO";
import { CourseModel } from "../../../infrastructure/database/CourseModel";

export class UpdateCourseUseCase {
  async execute(
    id: string,
    data: Partial<BaseCourse>,
    session?: mongoose.ClientSession
  ) {
    return await CourseModel.findByIdAndUpdate(id, data, {
      new: true,
      session: session || null,
    })
      .populate("curriculum.subject")
      .lean<CourseDTO>();
  }
}
