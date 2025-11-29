export interface BaseSubjectTaken {
  subjectId: string;
  employeeId: string;
  prelim?: number;
  midterm?: number;
  finals?: number;
  finalGrade?: number;
  remarks?: string;
}

export interface SubjectTaken extends BaseSubjectTaken {
  createdAt: Date;
  updatedAt: Date;
}
