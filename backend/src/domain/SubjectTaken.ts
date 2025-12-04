import { Schema } from "mongoose";

export enum SubjectStatus {
  Enrolled = "enrolled",
  Passed = "passed",
  Failed = "failed",
  Dropped = "dropped",
  Credited = "credited",
}

export interface BaseSubjectTaken {
  subjectId: string;
  prelim?: number;
  midterm?: number;
  final?: number;
  finalGrade?: number;
  remarks?: string;
  status: SubjectStatus;
}

export interface SubjectTaken extends BaseSubjectTaken {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
