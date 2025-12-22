import { Schema } from "mongoose";
import { Subject } from "./Subject";
import { Semester } from "./types/Semester";
import { SectionDTO } from "../interfaces/http/types/SectionDTO";
import { StudentDTO } from "../interfaces/http/types/StudentDTO";
import { StaffDTO } from "../interfaces/http/types/StaffDTO";
import { SubjectScheduleDTO } from "../interfaces/http/types/SubjectScheduleDTO";
import { RoomDTO } from "../interfaces/http/types/RoomDTO";

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
  studentId: string;
  scheduleId: Schema.Types.ObjectId; // Link to the specific Class Schedule
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
  student?: StudentDTO;
  schedule?: SubjectScheduleDTO;
}

export interface SubjectTaken extends BaseSubjectTaken {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
