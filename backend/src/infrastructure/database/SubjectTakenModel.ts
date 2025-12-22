import mongoose, { Schema } from "mongoose";
import { BaseSubjectTaken, SubjectStatus } from "../../domain/SubjectTaken";
import { Semester } from "../../domain/types/Semester";

export const SubjectTakenSchema = new Schema<BaseSubjectTaken & Document>(
  {
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    studentId: { type: String, required: true },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "SubjectSchedule",
      required: false, // Optional for credited subjects
    },
    schoolYear: { type: String, required: true },
    semester: {
      type: Number,
      enum: Object.values(Semester).map(Number),
      required: true,
    },
    prelim: { type: Number },
    midterm: { type: Number },
    final: { type: Number },
    finalGrade: { type: Number },
    remarks: { type: String },
    status: {
      type: String,
      enum: Object.values(SubjectStatus),
      default: SubjectStatus.Ongoing,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SubjectTakenSchema.index({ studentId: 1 });
SubjectTakenSchema.index({ subject: 1 });
SubjectTakenSchema.index({ scheduleId: 1 });

SubjectTakenSchema.virtual("student", {
  ref: "Student",
  localField: "studentId",
  foreignField: "studentId",
  justOne: true,
});

SubjectTakenSchema.virtual("schedule", {
  ref: "SubjectSchedule",
  localField: "scheduleId",
  foreignField: "_id",
  justOne: true,
});

export const SubjectTakenModel = mongoose.model(
  "SubjectTaken",
  SubjectTakenSchema
);
