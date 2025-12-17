import { Schema } from "mongoose";
import { TeacherDetails } from "./TeacherDetails";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: number;
}

export interface BaseStaffProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  address?: Address;
  department: string;
  hireDate: Date;
  teacherDetails?: TeacherDetails;
}

export interface StaffProfile extends BaseStaffProfile {
  // Embedded
}

export interface BaseStaff {
  userId: Schema.Types.ObjectId;
  employeeId: string;
  profile?: StaffProfile;
}

export interface Staff extends BaseStaff {
  _id: Schema.Types.ObjectId;
  isActive: boolean;
}
