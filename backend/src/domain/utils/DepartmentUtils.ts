import { GradeLevel } from "../types/GradeLevel";

export enum Department {
  College = "College",
  K12 = "K12",
}

export function getDepartment(gradeLevel: GradeLevel): Department {
  if (
    [
      GradeLevel.College1,
      GradeLevel.College2,
      GradeLevel.College3,
      GradeLevel.College4,
      GradeLevel.College5,
      GradeLevel.College6,
    ].includes(gradeLevel)
  ) {
    return Department.College;
  }
  return Department.K12;
}
