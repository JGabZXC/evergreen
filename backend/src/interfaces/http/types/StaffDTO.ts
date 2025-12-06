import { BaseStaffProfile, Staff, StaffProfile } from "../../../domain/Staff";
import { UserDTO } from "./UserDTO";

export type BaseStaffProfileDTO = Omit<
  BaseStaffProfile,
  "dateOfBirth" | "hireDate"
> & {
  dateOfBirth: string;
  hireDate: string;
};

export type StaffProfileDTO = Omit<
  StaffProfile,
  "createdAt" | "updatedAt" | "_id"
> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export type StaffDTO = Omit<Staff, "_id" | "userId"> & {
  _id: string;
  userId: string;
};

export type TeacherDTO = Omit<Staff, "_id" | "userId"> & {
  _id: string;
  userId: UserDTO;
};
