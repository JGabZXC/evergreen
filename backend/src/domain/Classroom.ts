import { Schema } from "mongoose";
import { GradeLevel } from "./Subject";

export interface BaseClassroom {
  adviserId: string;
  name: string; // This is the section name
  gradeLevel: GradeLevel;
  capacity: number;
  currentCapacity: number;
}

export interface Classroom extends BaseClassroom {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
