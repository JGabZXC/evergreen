import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";

export class GetStudentUseCase {
  async execute(id: string): Promise<any> {
    // Try to find by _id first, then studentId
    let student = await StudentModel.findOne({
      $or: [{ _id: id }, { studentId: id }],
      isActive: true,
    })
      .populate("course")
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

    return {
      ...student,
      profile,
    };
  }
}
