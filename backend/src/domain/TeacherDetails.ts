import { Schema } from "mongoose";

export interface Degree {
  field: string;
  institution: string;
  yearCompleted: number;
}

export interface BaseTeacherDetails {
  specializations?: string[];
  masteralDegree?: Degree[];
  doctoralDegree?: Degree[];
}

export interface TeacherDetails extends BaseTeacherDetails {
  // _id: Schema.Types.ObjectId; // Embedded, might not need own ID unless specified
}
