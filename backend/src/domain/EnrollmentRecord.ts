import { Schema } from "mongoose";

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
  gradeLevel: string; // e,g "Grade 10", "Grade 11"
  section?: string;
  enrollmentDate: Date;
  status: EnrollmentStatus;
  schoolYear: string;
  adviser?: Schema.Types.ObjectId; // Teacher reference
  subjectTaken?: string;
  semester?: number;
}

export interface EnrollmentRecord extends BaseEnrollmentRecord {
  createdAt: Date;
  updatedAt: Date;
}
