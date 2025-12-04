// backend/src/application/use-cases/student/GetStudentGradesUseCase.ts
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";

export class GetStudentGradesUseCase {
  async execute(studentId: string) {
    // 1. Query grades for this student
    const grades = await SubjectTakenModel.find({ studentId })
      .populate({
        path: "subject", // Show Subject Name (e.g., "Math 101")
        select: "name code units",
      })
      .populate({
        path: "teacher", // Show Teacher Name
        select: "firstName lastName",
      })
      .sort({ schoolYear: -1, term: -1 }); // Sort by latest semester

    // 2. (Optional) Grouping Logic
    // You can return the raw array, or group them by School Year in JS here
    // For now, returning the list is flexible for the Frontend.
    return grades;
  }
}
