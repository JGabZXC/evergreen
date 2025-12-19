import { EnrollmentRecordModel } from "../../../infrastructure/database/EnrollmentRecordModel";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { EnrollmentStatus } from "../../../domain/EnrollmentRecord";

export class GetStudentsBySectionUseCase {
  async execute(sectionId: string) {
    const enrollments = await EnrollmentRecordModel.find({
      section: sectionId,
      status: EnrollmentStatus.Enrolled,
    }).lean();

    const studentIds = enrollments.map((e) => e.studentId);

    const students = await StudentModel.find({
      studentId: { $in: studentIds },
    }).lean();

    return students;
  }
}
