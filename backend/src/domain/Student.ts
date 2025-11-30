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
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseStudent {
  userId: Schema.Types.ObjectId;
  studentId: string;
}

export interface Student extends BaseStudent {
  _id: Schema.Types.ObjectId;
}
