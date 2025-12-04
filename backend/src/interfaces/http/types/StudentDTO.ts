import {
  BaseStudentProfile,
  Student,
  StudentProfile,
} from "../../../domain/Student";
import { CourseDTO } from "./CourseDTO";
export type BaseStudentProfileDTO = Omit<BaseStudentProfile, "dateOfBirth"> & {
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
