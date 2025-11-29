import { Schema } from "mongoose";

interface Address {
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
  position: string;
  department: string;
  hireDate: Date;
}

export interface StaffProfile extends BaseStaffProfile {
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  userId: Schema.Types.ObjectId;
  employeeId: string;
}
