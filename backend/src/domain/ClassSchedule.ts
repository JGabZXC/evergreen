import { Schema } from "mongoose";
import { Staff } from "./Staff";
import { Semester } from "./types/Semester";

export interface TimeSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  room: string;
}

export interface BaseClassSchedule {
  classroomId: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  teacherId: string; // Employee ID
  schedules: TimeSlot[];
  schoolYear: string;
  semester: Semester;

  // Virtuals
  teacher?: Staff;
}

export interface ClassSchedule extends BaseClassSchedule {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
