import { BaseStaffProfile, Staff, StaffProfile } from "../../../domain/Staff";
import { UserDTO } from "./UserDTO";

export type BaseStaffProfileDTO = Omit<
  BaseStaffProfile,
  "dateOfBirth" | "hireDate"
> & {
  dateOfBirth: string;
  hireDate: string;
};

export type StaffProfileDTO = BaseStaffProfileDTO;

export type StaffDTO = Omit<Staff, "_id" | "userId" | "profile"> & {
  _id: string;
  userId: string;
  profile?: StaffProfileDTO;
};

export type PopulatedStaffDTO = Omit<StaffDTO, "userId"> & {
  userId: UserDTO | string;
};

export type TeacherDTO = Omit<Staff, "_id" | "userId" | "profile"> & {
  _id: string;
  userId: UserDTO;
  profile?: StaffProfileDTO;
};
