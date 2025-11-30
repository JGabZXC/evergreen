import mongoose, { Schema } from "mongoose";
import {
  EnrollmentRecord,
  EnrollmentStatus,
} from "../../domain/EnrollmentRecord";
import { GradeLevel } from "../../domain/Subject";
import { Semester } from "../../domain/types/Semester";
import { SubjectTakenSchema } from "./SubjectTakenModel";

const EnrollmentRecordSchema = new Schema<EnrollmentRecord & Document>(
  {
    studentId: { type: String, ref: "Student", required: true },
    gradeLevel: {
      type: String,
      enum: Object.values(GradeLevel),
      required: true,
    },
    enrollmentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      required: true,
    },
    section: { type: String },
    schoolYear: { type: String, required: true },
    adviser: { type: Schema.Types.ObjectId, ref: "Staff" },
    subjectTaken: [SubjectTakenSchema],
    semester: { type: Number, enum: Object.values(Semester), required: true },
  },
  {
    timestamps: true,
  }
);

EnrollmentRecordSchema.index({ studentId: 1, "subjectTaken.subjectId": 1 });

export const EnrollmentRecordModel = mongoose.model<
  EnrollmentRecord & Document
>("EnrollmentRecord", EnrollmentRecordSchema);
