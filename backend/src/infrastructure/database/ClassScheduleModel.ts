import mongoose, { Schema, Document } from "mongoose";
import { ClassSchedule } from "../../domain/ClassSchedule";

const TimeSlotSchema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
});

const ClassScheduleSchema = new Schema<ClassSchedule & Document>(
  {
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacherId: { type: String, default: "TBA" },
    schedules: [TimeSlotSchema],
    schoolYear: { type: String, required: true },
    semester: { type: Number, required: true },
  },
  { timestamps: true }
);

ClassScheduleSchema.index(
  { classroomId: 1, subject: 1, schoolYear: 1, semester: 1 },
  { unique: true }
);

ClassScheduleSchema.virtual("teacher", {
  ref: "Staff",
  localField: "teacherId",
  foreignField: "employeeId",
  justOne: true,
});

export const ClassScheduleModel = mongoose.model<ClassSchedule & Document>(
  "ClassSchedule",
  ClassScheduleSchema
);
