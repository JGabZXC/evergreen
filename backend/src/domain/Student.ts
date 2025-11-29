export interface ParentContact {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}
import { Schema } from "mongoose";

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
  address?: string;
  guardianDetails?: GuardianDetails;
}

export interface StudentProfile extends BaseStudentProfile {
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  userId: Schema.Types.ObjectId;
  studentId: string;
}
