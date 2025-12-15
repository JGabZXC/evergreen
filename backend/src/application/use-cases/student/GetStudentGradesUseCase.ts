import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { SubjectTakenDTO } from "../../../interfaces/http/types/SubjectTakenDTO";

export class GetStudentGradesUseCase {
  async execute(studentId: string) {
    const grades = await SubjectTakenModel.find({ studentId })
      .populate({
        path: "subject",
        select: "name code",
      })
      .populate({
        path: "teacher",
        select: "firstName lastName",
      })
      .lean<SubjectTakenDTO>();

    return grades;
  }
}
