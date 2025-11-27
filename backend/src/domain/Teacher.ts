import { User, UserDetail, Role } from "./User";

export interface Teacher extends User {
  role: Role.Teacher;
  details: UserDetail;
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
