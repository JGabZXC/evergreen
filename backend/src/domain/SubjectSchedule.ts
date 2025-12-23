import { Schema } from "mongoose";
import { Staff } from "./Staff";
import { Semester } from "./types/Semester";

export interface TimeSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  room: Schema.Types.ObjectId;
  teacherId: string; // Employee ID
  teacher?: Staff; // Virtual
}

export interface BaseSubjectSchedule {
  subject: Schema.Types.ObjectId;
  schedules: TimeSlot[];
  schoolYear: string;
  semester: Semester;
}

export interface SubjectSchedule extends BaseSubjectSchedule {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
