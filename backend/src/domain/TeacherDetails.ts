interface Degree {
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
  createdAt: Date;
  updatedAt: Date;
}
