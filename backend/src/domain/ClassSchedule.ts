import { Schema } from "mongoose";

export interface TimeSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  room: string;
}

export interface BaseClassSchedule {
  classroomId: Schema.Types.ObjectId;
  subjectId: string;
  teacherId: string;
  schedules: TimeSlot[];
  schoolYear: string;
  semester: number;
}

export interface ClassSchedule extends BaseClassSchedule {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
