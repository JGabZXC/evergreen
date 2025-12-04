import { Schema } from "mongoose";
import { Subject } from "./Subject";
import { Staff } from "./Staff";
import { Student } from "./Student";

export enum SubjectStatus {
  Enrolled = "enrolled",
  Passed = "passed",
  Failed = "failed",
  Dropped = "dropped",
  Credited = "credited",
}

export interface BaseSubjectTaken {
  subjectId: string;
  teacherId: string;
  studentId: string;
  classroomId: Schema.Types.ObjectId;
  schoolYear: string;
  semester: number;
  prelim?: number;
  midterm?: number;
  final?: number;
  finalGrade?: number;
  remarks?: string;
  status: SubjectStatus;

  // VIRTUALS
  subject: Subject;
  student: Student;
  teacher: Staff;
}

export interface SubjectTaken extends BaseSubjectTaken {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
