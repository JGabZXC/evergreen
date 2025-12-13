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
    // classroomId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Section", // Changed from Classroom to Section as per SectionModel
    //   required: true,
    // },
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

export const SubjectScheduleModel = mongoose.model<SubjectSchedule & Document>(
  "SubjectSchedule",
  SubjectScheduleSchema
);
