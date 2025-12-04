import { Schema } from "mongoose";
import { BaseSubjectTaken, SubjectStatus } from "../../domain/SubjectTaken";

export const SubjectTakenSchema = new Schema<BaseSubjectTaken & Document>(
  {
    subjectId: { type: String, required: true },
    prelim: { type: Number },
    midterm: { type: Number },
    final: { type: Number },
    finalGrade: { type: Number },
    remarks: { type: String },
    status: {
      type: String,
      enum: Object.values(SubjectStatus),
      default: SubjectStatus.Enrolled,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// export const SubjectTakenModel = mongoose.model<BaseSubjectTaken & Document>(
//   "SubjectTaken",
//   SubjectTakenSchema
// );
