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
    subjectId: { type: String, required: true }, // Store Subject ID String (e.g., "CC-101")
    teacherId: { type: String, default: "TBA" }, // Store Employee ID (e.g., "EMP-001")
    schedules: [TimeSlotSchema],
    schoolYear: { type: String, required: true },
    semester: { type: Number, required: true },
  },
  { timestamps: true }
);

ClassScheduleSchema.index({ teacherId: 1, schoolYear: 1, semester: 1 });
ClassScheduleSchema.index({ classroomId: 1, subjectId: 1 }, { unique: true });

export const ClassScheduleModel = mongoose.model<ClassSchedule & Document>(
  "ClassSchedule",
  ClassScheduleSchema
);
