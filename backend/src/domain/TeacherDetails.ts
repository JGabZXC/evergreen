import { Schema } from "mongoose";

export interface Degree {
  field: string;
  institution: string;
  yearCompleted: number;
}

export interface BaseTeacherDetails {
  employeeId: string;
  specializations?: string[];
  masteralDegree?: Degree[];
  doctoralDegree?: Degree[];
}

export interface TeacherDetails extends BaseTeacherDetails {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
