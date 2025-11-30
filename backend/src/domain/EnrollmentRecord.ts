import { Schema } from "mongoose";
import { Semester } from "./types/Semester";
import { BaseSubjectTaken, SubjectTaken } from "./SubjectTaken";
import { GradeLevel } from "./Subject";

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
  section?: string;
  enrollmentDate: Date;
  status: EnrollmentStatus;
  schoolYear: string;
  adviser?: Schema.Types.ObjectId; // Teacher reference
  subjectTaken?: BaseSubjectTaken[];
  semester?: Semester;
}

export interface EnrollmentRecord extends BaseEnrollmentRecord {
  _id: Schema.Types.ObjectId;
  subjectTaken?: SubjectTaken[];
  createdAt: Date;
  updatedAt: Date;
}
