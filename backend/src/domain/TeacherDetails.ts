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
