import { CourseModel } from "../../../infrastructure/database/CourseModel";
import { CourseDTO } from "../../../interfaces/http/types/CourseDTO";

export class GetCourseUseCase {
  async execute(code: string) {
    return await CourseModel.findOne({ code })
      .populate("curriculum.subject")
      .lean<CourseDTO>();
  }
}
