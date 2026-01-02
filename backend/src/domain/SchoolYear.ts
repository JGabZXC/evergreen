import { Semester } from "./types/Semester";

export enum SchoolYearStatus {
  Active = "Active",
  Closed = "Closed",
  Upcoming = "Upcoming",
}

export interface TermPeriod {
  semester: Semester;
  startDate: Date;
  endDate: Date;
}

export interface DepartmentPeriods {
  college: TermPeriod[];
  k12: TermPeriod[];
}

export interface BaseSchoolYear {
  year: string; // e.g., "2023-2024"
  startDate: Date;
  endDate: Date;
  status: SchoolYearStatus;
  terms: DepartmentPeriods;
}

export interface SchoolYear extends BaseSchoolYear {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
