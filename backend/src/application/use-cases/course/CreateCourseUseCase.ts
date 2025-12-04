import mongoose from "mongoose";
import { BaseCourse } from "../../../domain/Course";
import { CourseModel } from "../../../infrastructure/database/CourseModel";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class CreateCourseUsecase {
  async execute(data: BaseCourse, session?: mongoose.ClientSession) {
    try {
      const [createdCourse] = await CourseModel.create([data], {
        session: session || null,
      });
      return createdCourse;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictError("Course code already exists", err.keyValue);
      }
      throw err;
    }
  }
}
