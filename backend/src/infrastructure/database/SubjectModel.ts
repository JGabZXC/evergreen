import mongoose, { Schema } from "mongoose";
import { Subject } from "../../domain/Subject";
import { Semester } from "../../domain/types/Semester";

const SubjectSchema = new Schema<Subject & Document>({
  name: { type: String, required: true },
  subjectId: { type: String, required: true, unique: true },
  description: { type: String },
  // targetGradeLevels: {
  //   type: [String],
  //   enum: Object.values(GradeLevel),
  //   required: true,
  // },
  semesterAvailable: {
    type: [Number],
    enum: Object.values(Semester).map(Number),
    required: true,
  },
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
});

export const SubjectModel = mongoose.model<Subject & Document>(
  "Subject",
  SubjectSchema
);
