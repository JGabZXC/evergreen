import { Student, StudentProfile } from "../../../domain/Student";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import mongoose, { FilterQuery } from "mongoose";

export class GetStudentUseCase {
  async execute(id: string): Promise<Student & { profile?: StudentProfile }> {
    const query: FilterQuery<any> = { isActive: true };

    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.studentId = id;
    }

    let student = await StudentModel.findOne(query)
      .populate({
        path: "course",
        populate: {
          path: "curriculum.subject",
        },
      })
      .lean();

    if (!student) {
      // If not found by _id or studentId, try to check if it's a valid ObjectId and search just by _id
      // (The $or query above handles both, but if 'id' is not a valid ObjectId, mongo might throw or just not match _id.
      // Mongoose usually handles string -> ObjectId casting in queries if the schema defines it as ObjectId.
      // However, studentId is a string.
      // If 'id' is "2023-0001", it matches studentId.
      // If 'id' is a mongoId, it matches _id.
      // Let's rely on the $or query, but we might need to handle casting issues if strict.
      // For now, assuming the input is safe or handled by mongoose casting.
      throw new NotFoundError("Student not found");
    }

    const profile = await StudentProfileModel.findOne({
      studentId: student.studentId,
    }).lean();

    const result = { ...student } as Student & { profile?: StudentProfile };

    if (profile) {
      result.profile = profile as unknown as StudentProfile;
    }

    return result;
  }
}
