import mongoose, { Schema } from "mongoose";
import { BaseSubjectTaken, SubjectStatus } from "../../domain/SubjectTaken";
import { Semester } from "../../domain/types/Semester";

export const SubjectTakenSchema = new Schema<BaseSubjectTaken & Document>(
  {
    subjectId: { type: String, required: true },
    teacherId: { type: String, required: true },
    studentId: { type: String, required: true },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    schoolYear: { type: String, required: true },
    semester: { type: Number, enum: Object.values(Semester), required: true },
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

SubjectTakenSchema.virtual("subject", {
  ref: "Subject",
  localField: "subjectId",
  foreignField: "subjectId",
  justOne: true,
});

SubjectTakenSchema.virtual("teacher", {
  ref: "Staff",
  localField: "teacherId",
  foreignField: "employeeId",
  justOne: true,
});

SubjectTakenSchema.virtual("student", {
  ref: "Student",
  localField: "studentId",
  foreignField: "studentId",
  justOne: true,
});

SubjectTakenSchema.virtual("classroom", {
  ref: "Classroom",
  localField: "classroomId",
  foreignField: "_id",
  justOne: true,
});

export const SubjectTakenModel = mongoose.model(
  "SubjectTaken",
  SubjectTakenSchema
);
