import { Schema } from "mongoose";

export interface TimeSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string; // "08:00" (24h format for easier comparison)
  endTime: string; // "09:30"
  room: string; // "Lab 1" or "Room 304"
}

export interface BaseClassSchedule {
  classroomId: Schema.Types.ObjectId; // The Section (e.g., BSCS 1-A)
  subjectId: string; // The Subject (e.g., CC-101)
  teacherId: string; // The Assigned Teacher
  schedules: TimeSlot[]; // Support split scheds (e.g., Mon/Wed)
  schoolYear: string;
  semester: number;
}

export interface ClassSchedule extends BaseClassSchedule {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
