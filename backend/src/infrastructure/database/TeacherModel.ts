import { Schema, model, Document } from "mongoose";
import { Teacher } from "../../domain/Teacher";

const TeacherModelSchema = new Schema<Teacher & Document>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  teacherId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  hireDate: { type: Date, required: true },
  specializations: { type: [String], default: [] },
  masteralDegree: [
    {
      field: { type: String, required: true },
      institution: { type: String, required: true },
      yearCompleted: { type: Number, required: true },
    },
  ],
  doctoralDegree: [
    {
      field: { type: String, required: true },
      institution: { type: String, required: true },
      yearCompleted: { type: Number, required: true },
    },
  ],
});

export const TeacherModel = model<Teacher & Document>(
  "Teacher",
  TeacherModelSchema
);
