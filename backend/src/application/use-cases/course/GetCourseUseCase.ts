import { CourseModel } from "../../../infrastructure/database/CourseModel";

export class GetCourseUseCase {
  async execute(code: string) {
    return await CourseModel.findOne({ code }).populate(
      "subjectToBeTaken.subject"
    );
  }
}
