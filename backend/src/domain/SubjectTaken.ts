import { Schema } from "mongoose";
import { Subject } from "./Subject";
import { Staff } from "./Staff";
import { Student } from "./Student";
import { Semester } from "./types/Semester";

export enum SubjectStatus {
  Enrolled = "Enrolled",
  Passed = "Passed",
  Failed = "Failed",
  Dropped = "Dropped",
  Credited = "Credited",
  Withdrawn = "Withdrawn",
}

export interface BaseSubjectTaken {
  subject: Schema.Types.ObjectId | Subject;
  teacherId: string; // "TBA" or ObjectId
  studentId: string;
  classroomId: Schema.Types.ObjectId;
  schoolYear: string;
  semester: Semester;

  // Grades
  prelim?: number;
  midterm?: number;
  final?: number;
  finalGrade?: number;
  remarks?: string;
  status: SubjectStatus;

  // VIRTUALS
  student: Student;
  teacher: Staff;
}

export interface SubjectTaken extends BaseSubjectTaken {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
