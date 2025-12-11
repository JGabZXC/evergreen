import { CourseModel } from "../../../infrastructure/database/CourseModel";
import { CourseDTO } from "../../../interfaces/http/types/CourseDTO";

export interface CourseFilter {
  code?: string;
  gradeAvailable?: "shs" | "college";
}

export class GetAllCourseUseCase {
  async execute(filter: CourseFilter, skip: number, limit: number) {
    const query: Record<string, any> = {};

    if (filter.code) {
      query.code = { $regex: filter.code, $options: "i" };
    }

    if (filter.gradeAvailable) {
      query.gradeAvailable = filter.gradeAvailable;
    }

    const [courses, totalDocs] = await Promise.all([
      CourseModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("curriculum.subject")
        .lean<CourseDTO[]>(),
      CourseModel.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return { totalDocs, totalPages, courses };
  }
}
