import {
  BaseStudentProfile,
  Student,
  StudentProfile,
} from "../../../domain/Student";
import { CourseDTO } from "./CourseDTO";
import { ErollmentRecordDTO } from "./EnrollmentDTO";
import { UserDTO } from "./UserDTO";

export type BaseStudentProfileDTO = Omit<BaseStudentProfile, "dateOfBirth"> & {
  dateOfBirth: string;
};

export type StudentProfileDTO = BaseStudentProfileDTO;

export type StudentDTO = Omit<Student, "_id" | "userId" | "profile"> & {
  _id: string;
  course: CourseDTO;
  userId: string;
  profile?: StudentProfileDTO;
};

export type PopulatedStudentDTO = Omit<StudentDTO, "userId"> & {
  userId: UserDTO;
};

export type StudentAggregateDTO = StudentDTO & {
  course: CourseDTO;
  latestEnrollment?: ErollmentRecordDTO;
};
