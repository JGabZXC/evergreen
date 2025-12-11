import { Schema } from "mongoose";
import { Semester } from "./types/Semester";

export interface BaseSubject {
  name: string;
  subjectId: string;
  description?: string;
  // targetGradeLevels: GradeLevel[];
  semesterAvailable: Semester[]; // e.g., [1, 2] for both semesters
}

export interface Subject extends BaseSubject {
  _id: Schema.Types.ObjectId;
  active: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
