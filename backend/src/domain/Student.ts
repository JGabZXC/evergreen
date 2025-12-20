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
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  address?: Address;
  guardianDetails?: GuardianDetails;
}

export interface BaseStudent {
  userId: Schema.Types.ObjectId;
  studentId: string;
  course: Schema.Types.ObjectId;
  profile?: BaseStudentProfile;
}

export interface Student extends BaseStudent {
  _id: Schema.Types.ObjectId;
  isActive: boolean;
}

export interface StudentAggregate extends Omit<Student, "course"> {
  course: Course;
  latestEnrollment?: EnrollmentRecord;
}
