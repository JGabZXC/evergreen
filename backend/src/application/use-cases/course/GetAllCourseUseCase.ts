import { CourseModel } from "../../../infrastructure/database/CourseModel";

export class GetAllCourseUseCase {
  async execute(skip: number, limit: number) {
    const [courses, totalDocs] = await Promise.all([
      CourseModel.find()
        .skip(skip)
        .limit(limit)
        .populate("subjectToBeTaken.subject"),
      CourseModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return { totalDocs, totalPages, courses };
  }
}
