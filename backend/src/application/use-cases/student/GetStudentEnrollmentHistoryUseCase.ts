import { EnrollmentRecordModel } from "../../../infrastructure/database/EnrollmentRecordModel";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";

export class GetStudentEnrollmentHistoryUseCase {
  async execute(studentId: string, page: number = 1, limit: number = 10) {
    // Check if student exists
    // studentId passed here is expected to be the Student Document ID (_id)
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new NotFoundError("Student not found");
    }

    // EnrollmentRecord stores 'studentId' as the Student String ID (e.g. "2023-0001") based on EnrollStudentUseCase logic.
    const skip = (page - 1) * limit;

    const history = await EnrollmentRecordModel.find({ studentId: student.studentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("section", "name");

    const total = await EnrollmentRecordModel.countDocuments({ studentId: student.studentId });

    return {
      history,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

