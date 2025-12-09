import { SubjectStatus } from "../../../domain/SubjectTaken";
import { Semester } from "../../../domain/types/Semester";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";

interface CreditInput {
  studentId: string;
  subjectId: string; // Map their old subject to YOUR subject ID
  previousSchool: string;
  finalGrade: number;
}

export class CreditTransferSubjectsUseCase {
  async execute(inputs: CreditInput[]) {
    const creditDocs = inputs.map((input) => ({
      studentId: input.studentId,
      subjectId: input.subjectId,
      teacherId: "CREDITED",
      classroomId: null, // No physical class attended
      schoolYear: "TRANSFERRED",
      semester: Semester.Zero, // Indicate transfer credit
      finalGrade: input.finalGrade,
      status: SubjectStatus.Credited,
      remarks: `Credited from ${input.previousSchool}`,
    }));

    return await SubjectTakenModel.insertMany(creditDocs);
  }
}
