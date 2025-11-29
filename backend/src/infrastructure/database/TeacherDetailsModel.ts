import { Schema, model, Document } from "mongoose";
import { TeacherDetails, Degree } from "../../domain/TeacherDetails";

const DegreeSchema = new Schema<Degree & Document>({
  field: { type: String, required: true },
  institution: { type: String, required: true },
  yearCompleted: { type: Number, required: true },
});

const TeacherDetailSchema = new Schema<TeacherDetails & Document>({
  employeeId: { type: String, required: true, unique: true },
  specializations: { type: [String], default: [] },
  masteralDegree: { type: [DegreeSchema], default: [] },
  doctoralDegree: { type: [DegreeSchema], default: [] },
});

export const TeacherDetailsModel = model<TeacherDetails & Document>(
  "TeacherDetails",
  TeacherDetailSchema
);
