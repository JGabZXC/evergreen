import { Schema } from "mongoose";
import { Semester } from "./types/Semester";
import { Staff } from "./Staff";

export enum GradeLevel {
  Grade1 = "G-1",
  Grade2 = "G-2",
  Grade3 = "G-3",
  Grade4 = "G-4",
  Grade5 = "G-5",
  Grade6 = "G-6",
  Grade7 = "G-7",
  Grade8 = "G-8",
  Grade9 = "G-9",
  Grade10 = "G-10",
  Grade11 = "SHS-11",
  Grade12 = "SHS-12",
  College1 = "COL-1",
  College2 = "COL-2",
  College3 = "COL-3",
  College4 = "COL-4",
  College5 = "COL-5",
  College6 = "COL-6",
}

export interface BaseSubject {
  name: string;
  subjectId: string;
  teacherId?: string;
  description?: string;
  targetGradeLevels: GradeLevel[];
  semesterAvailable: Semester[]; // e.g., [1, 2] for both semesters

  // VIRTUALS
  teacher?: Staff;
}

export interface Subject extends BaseSubject {
  _id: Schema.Types.ObjectId;
  active: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
