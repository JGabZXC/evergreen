import { Schema } from "mongoose";

export interface BaseSubjectTaken {
  subjectId: string;
  teacherId: string;
  prelim?: number;
  midterm?: number;
  final?: number;
  finalGrade?: number;
  remarks?: string;
}

export interface SubjectTaken extends BaseSubjectTaken {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
