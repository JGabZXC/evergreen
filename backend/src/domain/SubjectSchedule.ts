import { Schema } from "mongoose";
import { Staff } from "./Staff";
import { Semester } from "./types/Semester";

export interface TimeSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  room: Schema.Types.ObjectId;
}

export interface BaseSubjectSchedule {
  sectionId?: Schema.Types.ObjectId; // Optional: For block sections. If null, it's a mixed/open class.
  subject: Schema.Types.ObjectId;
  teacherId: string; // Employee ID
  schedules: TimeSlot[];
  schoolYear: string;
  semester: Semester;

  // Virtuals
  teacher?: Staff;
}

export interface SubjectSchedule extends BaseSubjectSchedule {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
