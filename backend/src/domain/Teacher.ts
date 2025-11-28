import { Schema } from "mongoose";

export interface Teacher {
  userId: Schema.Types.ObjectId;
  teacherId: string;
  department: string;
  hireDate: Date;
  specializations?: string[];
  masteralDegree?: [
    {
      field: string;
      institution: string;
      yearCompleted: number;
    },
  ];
  doctoralDegree?: [
    {
      field: string;
      institution: string;
      yearCompleted: number;
    },
  ];
}
