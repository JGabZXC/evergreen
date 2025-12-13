import { Schema } from "mongoose";
import { Semester } from "./types/Semester";
import { GradeLevel } from "./types/GradeLevel";

export enum EnrollmentStatus {
  Enrolled = "Enrolled",
  Passed = "Passed",
  Failed = "Failed",
  Dropped = "Dropped",
  Transferred = "Transferred",
  Graduated = "Graduated",
}

export interface BaseEnrollmentRecord {
  studentId: string;
  gradeLevel: GradeLevel;
  enrollmentDate: Date;
  status: EnrollmentStatus;
  schoolYear: string;
  section?: Schema.Types.ObjectId; // Section reference
  semester: Semester;
}

export interface EnrollmentRecord extends BaseEnrollmentRecord {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
