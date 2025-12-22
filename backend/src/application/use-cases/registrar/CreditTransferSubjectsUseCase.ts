import { SubjectStatus } from "../../../domain/SubjectTaken";
import { Semester } from "../../../domain/types/Semester";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";

interface CreditInput {
  studentId: string;
  subject: string; // ObjectId string
  previousSchool: string;
  finalGrade: number;
}

export class CreditTransferSubjectsUseCase {
  async execute(inputs: CreditInput[]) {
    const creditDocs = inputs.map((input) => ({
      studentId: input.studentId,
      subject: input.subject,
      teacherId: "CREDITED",
      roomId: null, // No physical class attended
      schoolYear: "TRANSFERRED",
      semester: Semester.Zero, // Indicate transfer credit
      finalGrade: input.finalGrade,
      status: SubjectStatus.Credited,
      remarks: `Credited from ${input.previousSchool}`,
    }));

    return await SubjectTakenModel.insertMany(creditDocs);
  }
}
