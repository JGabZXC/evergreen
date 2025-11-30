import { Schema } from "mongoose";
import { BaseSubjectTaken } from "../../domain/SubjectTaken";

export const SubjectTakenSchema = new Schema<BaseSubjectTaken & Document>(
  {
    subjectId: { type: String, required: true },
    teacherId: { type: String, required: true },
    prelim: { type: Number },
    midterm: { type: Number },
    final: { type: Number },
    finalGrade: { type: Number },
    remarks: { type: String },
  },
  {
    timestamps: true,
  }
);

// export const SubjectTakenModel = mongoose.model<BaseSubjectTaken & Document>(
//   "SubjectTaken",
//   SubjectTakenSchema
// );
