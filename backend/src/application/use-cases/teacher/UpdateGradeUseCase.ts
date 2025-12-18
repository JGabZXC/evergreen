// backend/src/application/use-cases/teacher/UpdateGradeUseCase.ts
import mongoose from "mongoose";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { SubjectStatus } from "../../../domain/SubjectTaken";

interface GradeInput {
  subjectTakenId: string; // The ID of the specific row in the grade sheet
  term: "prelim" | "midterm" | "final";
  grade: number;
  remarks?: string;
}

export class UpdateGradeUseCase {
  async execute(
    teacherId: string,
    input: GradeInput,
    session: mongoose.ClientSession
  ) {
    if (input.grade < 0 || input.grade > 100) {
      throw new BadRequestError("Grade must be between 0 and 100.");
    }

    // 1. Find the record and ensure this teacher owns it (Security)
    const record = await SubjectTakenModel.findOne({
      _id: input.subjectTakenId,
      teacherId: teacherId,
    });

    if (!record) {
      throw new NotFoundError(
        "Grade record not found or you are not the assigned teacher."
      );
    }

    // 2. Update the specific term grade
    if (input.term === "prelim") record.prelim = input.grade;
    if (input.term === "midterm") record.midterm = input.grade;
    if (input.term === "final") record.final = input.grade;

    // 3. Auto-Calculate Final Grade (Business Logic)
    // Only calculate if all 3 grades exist
    if (record.prelim && record.midterm && record.final) {
      // Example Formula: Average
      const average = (record.prelim + record.midterm + record.final) / 3;
      record.finalGrade = parseFloat(average.toFixed(2));

      // Determine Status
      record.remarks =
        input.remarks || (record.finalGrade >= 75 ? "Passed" : "Failed");
      record.status =
        record.finalGrade >= 75 ? SubjectStatus.Passed : SubjectStatus.Failed; // Enum update
    }

    (await record.save()).$session(session);
    return record;
  }
}
