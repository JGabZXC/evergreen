import {
  BaseStudentProfile,
  Student,
  StudentProfile,
} from "../../../domain/Student";
import { CourseDTO } from "./CourseDTO";
import { ErollmentRecordDTO } from "./EnrollmentDTO";
export type BaseStudentProfileDTO = Omit<
  BaseStudentProfile,
  "studentId" | "dateOfBirth"
> & {
  dateOfBirth: string;
};

export type StudentProfileDTO = Omit<
  StudentProfile,
  "createdAt" | "updatedAt" | "_id"
> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export type StudentDTO = Omit<Student, "_id" | "userId"> & {
  _id: string;
  course: CourseDTO;
  userId: string;
};

export type StudentAggregateDTO = StudentDTO & {
  course: CourseDTO;
  profile?: StudentProfileDTO;
  latestEnrollment?: ErollmentRecordDTO;
};
