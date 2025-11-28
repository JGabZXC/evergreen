import { Schema } from "mongoose";

export enum Role {
  Student = "student",
  Teacher = "teacher",
  Admin = "admin",
  Staff = "staff",
  Registrar = "registrar",
  Approver = "approver",
}

export interface UserDetail {
  userId?: Schema.Types.ObjectId;
  profilePictureUrl?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
}

export interface User {
  email: string;
  password: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
  active?: boolean;
}
