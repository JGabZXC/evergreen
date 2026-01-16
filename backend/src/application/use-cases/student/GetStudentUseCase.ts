import { Student } from "../../../domain/Student";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import mongoose, { FilterQuery } from "mongoose";

export class GetStudentUseCase {
  async execute(id: string): Promise<Student> {
    const query: FilterQuery<Record<string, string | boolean>> = { isActive: true };

    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.studentId = id;
    }

    const student = await StudentModel.findOne(query)
      .populate({
        path: "course",
        populate: {
          path: "curriculum.subject",
        },
      })
      .lean();

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    return student as Student;
  }
}
