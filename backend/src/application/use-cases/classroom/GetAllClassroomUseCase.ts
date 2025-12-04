import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";

export class GetAllClassroomUseCase {
  async execute(skip: number, limit: number) {
    const [classrooms, totalDocs] = await Promise.all([
      ClassroomModel.find().skip(skip).limit(limit),
      ClassroomModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);
    return {
      totalDocs: totalDocs,
      totalPages,
      classrooms,
    };
  }
}
