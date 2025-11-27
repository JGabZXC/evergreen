export interface ParentContact {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

import { Teacher } from "./Teacher";
import { User, UserDetail, Role } from "./User";

export interface EnrollmentRecord {
  gradeLevel: string;
  section?: string;
  enrollmentDate: Date;
  schoolYear: string;
  adviser?: Teacher;
}

export interface Student extends User {
  role: Role.Student;
  studentId: string;
  details: UserDetail;
  enrollments: EnrollmentRecord[];
}
