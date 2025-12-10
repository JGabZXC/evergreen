import { Schema } from "mongoose";
import { SubjectDTO } from "../interfaces/http/types/SubjectDTO";
import { Subject } from "./Subject";
import { Staff } from "./Staff";

export interface TimeSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  room: string;
}

export interface BaseClassSchedule {
  classroomId: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  teacherId: string;
  schedules: TimeSlot[];
  schoolYear: string;
  semester: number;

  // Virtuals
  teacher?: Staff;
}

export interface ClassSchedule extends BaseClassSchedule {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
