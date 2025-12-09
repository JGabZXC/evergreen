export interface ParentContact {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}
import { Schema } from "mongoose";
import { Address } from "./Staff";
import { EnrollmentRecord } from "./EnrollmentRecord";
import { Course } from "./Course";

export interface GuardianDetails {
  name: string;
  contact: string;
  relation: string;
}

export interface BaseStudentProfile {
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  address?: Address;

  guardianDetails?: GuardianDetails;
}

export interface StudentProfile extends BaseStudentProfile {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseStudent {
  userId: Schema.Types.ObjectId;
  studentId: string;
  course: Schema.Types.ObjectId;
}

export interface Student extends BaseStudent {
  _id: Schema.Types.ObjectId;
  formattedId: string;
  isActive: boolean;
}

export interface StudentAggregate extends Omit<Student, "course"> {
  course: Course;
  profile?: StudentProfile;
  latestEnrollment?: EnrollmentRecord;
}
