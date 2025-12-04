import mongoose from "mongoose";
import { BaseCourse } from "../../../domain/Course";
import { CourseDTO } from "../../../interfaces/http/types/CourseDTO";

export class UpdateCourseUseCase {
  async execute(
    id: string,
    data: Partial<BaseCourse>,
    session?: mongoose.ClientSession
  ) {
    return await mongoose
      .model("Course")
      .findByIdAndUpdate(id, data, { new: true, session: session || null })
      .lean<CourseDTO>();
  }
}
