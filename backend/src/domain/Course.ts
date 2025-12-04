import { Schema } from "mongoose";
import { Semester } from "./types/Semester";
import { GradeLevel } from "./Subject";

export interface SubjectToBeTaken {
  semester: Semester;
  gradeLevel: GradeLevel;
  subject: Schema.Types.ObjectId[];
}

export interface BaseCourse {
  name: string;
  code: string;
  gradeAvailable: "shs" | "college";
  subjectToBeTaken: SubjectToBeTaken[];
}

export interface Course extends BaseCourse {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
