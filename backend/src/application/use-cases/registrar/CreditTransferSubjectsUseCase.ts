import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";

interface CreditInput {
  studentId: string;
  subjectId: string; // Map their old subject to YOUR subject ID
  previousSchool: string;
  finalGrade: number;
}

export class CreditTransferSubjectsUseCase {
  async execute(inputs: CreditInput[]) {
    // Bulk create "Passed" records
    const creditDocs = inputs.map((input) => ({
      studentId: input.studentId,
      subjectId: input.subjectId,
      teacherId: "SYSTEM", // Or "CREDITED"
      section: "N/A",
      classroomId: null, // No physical class attended
      schoolYear: "TRANSFERRED",
      term: 0,
      finalGrade: input.finalGrade,
      status: "Passed", // Or add a specific "Credited" enum
      remarks: `Credited from ${input.previousSchool}`,
    }));

    return await SubjectTakenModel.insertMany(creditDocs);
  }
}
