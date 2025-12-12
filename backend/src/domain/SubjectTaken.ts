import { Schema } from "mongoose";
import { Subject } from "./Subject";
import { Semester } from "./types/Semester";
import { SectionDTO } from "../interfaces/http/types/SectionDTO";
import { StudentDTO } from "../interfaces/http/types/StudentDTO";
import { StaffDTO } from "../interfaces/http/types/StaffDTO";
import { SubjectScheduleDTO } from "../interfaces/http/types/SubjectScheduleDTO";

export enum SubjectStatus {
  Ongoing = "Ongoing",
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
  teacher?: StaffDTO;
  student?: StudentDTO;
  classroom?: SectionDTO;
  scheduleDetails?: SubjectScheduleDTO;
}

export interface SubjectTaken extends BaseSubjectTaken {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
