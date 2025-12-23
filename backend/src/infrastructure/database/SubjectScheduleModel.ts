import mongoose, { Schema, Document } from "mongoose";
import { SubjectSchedule } from "../../domain/SubjectSchedule";

const TimeSlotSchema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  teacherId: { type: String, required: true },
});

// Virtual for teacher inside TimeSlot (Note: Mongoose subdocument virtuals work differently, usually need explicit population)
TimeSlotSchema.virtual("teacher", {
  ref: "Staff",
  localField: "teacherId",
  foreignField: "employeeId",
  justOne: true,
});

const SubjectScheduleSchema = new Schema<SubjectSchedule & Document>(
  {
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    schedules: [TimeSlotSchema],
    schoolYear: { type: String, required: true },
    semester: { type: Number, required: true },
  },
  { timestamps: true }
);

export const SubjectScheduleModel = mongoose.model<SubjectSchedule & Document>(
  "SubjectSchedule",
  SubjectScheduleSchema
);
