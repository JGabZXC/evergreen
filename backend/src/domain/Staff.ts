import { Schema } from "mongoose";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: number;
}

export interface BaseStaffProfile {
  employeeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  address?: Address;
  department: string;
  hireDate: Date;
}

export interface StaffProfile extends BaseStaffProfile {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseStaff {
  userId: Schema.Types.ObjectId;
  employeeId: string;
}

export interface Staff extends BaseStaff {
  _id: Schema.Types.ObjectId;
  isActive: boolean;
  formattedId: string;
}
