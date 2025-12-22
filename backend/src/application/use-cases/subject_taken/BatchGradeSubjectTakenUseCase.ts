import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { BaseSubjectTaken, SubjectStatus } from "../../../domain/SubjectTaken";
import { AnyBulkWriteOperation, Document, ObjectId } from "mongoose";

export interface GradeEntry {
  subjectTakenId: string;
  prelim?: number;
  midterm?: number;
  final?: number;
  finalGrade?: number;
  remarks?: string;
  status?: SubjectStatus;
}

export class BatchGradeSubjectTakenUseCase {
  async execute(grades: GradeEntry[]) {
    if (grades.length === 0) return;

    const bulkOps: AnyBulkWriteOperation<BaseSubjectTaken & Document>[] =
      grades.map((grade) => {
        const update: Partial<BaseSubjectTaken> = {};

        if (grade.prelim !== undefined) update.prelim = grade.prelim;
        if (grade.midterm !== undefined) update.midterm = grade.midterm;
        if (grade.final !== undefined) update.final = grade.final;
        if (grade.finalGrade !== undefined)
          update.finalGrade = grade.finalGrade;
        if (grade.remarks !== undefined) update.remarks = grade.remarks;
        if (grade.status !== undefined) update.status = grade.status;

        return {
          updateOne: {
            filter: { _id: grade.subjectTakenId as unknown as ObjectId },
            update: { $set: update },
          },
        };
      });

    await SubjectTakenModel.bulkWrite(bulkOps);
  }
}
