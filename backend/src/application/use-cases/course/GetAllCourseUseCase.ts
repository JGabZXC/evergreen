import { CourseModel } from "../../../infrastructure/database/CourseModel";
import { CourseDTO } from "../../../interfaces/http/types/CourseDTO";

export class GetAllCourseUseCase {
  async execute(skip: number, limit: number) {
    const [courses, totalDocs] = await Promise.all([
      CourseModel.find()
        .skip(skip)
        .limit(limit)
        .populate("curriculum.subject")
        .lean<CourseDTO[]>(),
      CourseModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return { totalDocs, totalPages, courses };
  }
}
