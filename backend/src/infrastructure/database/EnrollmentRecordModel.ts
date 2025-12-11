import mongoose, { Schema } from "mongoose";
import {
  EnrollmentRecord,
  EnrollmentStatus,
} from "../../domain/EnrollmentRecord";
import { Semester } from "../../domain/types/Semester";
import { GradeLevel } from "../../domain/types/GradeLevel";

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
    schoolYear: { type: String, required: true },
    classroom: { type: Schema.Types.ObjectId, ref: "Classroom" },
    semester: {
      type: Number,
      enum: Object.values(Semester).map(Number),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

EnrollmentRecordSchema.index({ studentId: 1, "subjectTaken.subjectId": 1 });

export const EnrollmentRecordModel = mongoose.model<
  EnrollmentRecord & Document
>("EnrollmentRecord", EnrollmentRecordSchema);
