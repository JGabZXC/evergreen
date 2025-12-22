import mongoose, { Schema, Document } from "mongoose";
import { SubjectSchedule } from "../../domain/SubjectSchedule";

const TimeSlotSchema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
});

const SubjectScheduleSchema = new Schema<SubjectSchedule & Document>(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: false, // Changed to false to support mixed/open classes
    },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacherId: { type: String, default: "TBA" },
    schedules: [TimeSlotSchema],
    schoolYear: { type: String, required: true },
    semester: { type: Number, required: true },
  },
  { timestamps: true }
);

SubjectScheduleSchema.virtual("teacher", {
  ref: "Staff",
  localField: "teacherId",
  foreignField: "employeeId",
  justOne: true,
});

SubjectScheduleSchema.virtual("section", {
  ref: "Section",
  localField: "sectionId",
  foreignField: "_id",
  justOne: true,
});

export const SubjectScheduleModel = mongoose.model<SubjectSchedule & Document>(
  "SubjectSchedule",
  SubjectScheduleSchema
);
