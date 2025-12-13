import { Schema } from "mongoose";
import { GradeLevel } from "./types/GradeLevel";

export interface BaseSection {
  adviserId: string;
  name: string; // This is the section name
  gradeLevel: GradeLevel;
  schoolYear: string;
  // capacity: number;
  currentCapacity: number;
  designatedRoom?: Schema.Types.ObjectId;
}

export interface Section extends BaseSection {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
