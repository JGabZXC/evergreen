import { User } from "../../../domain/User";
import { StaffDTO } from "./StaffDTO";
import { StudentDTO } from "./StudentDTO";

export type UserDTO = Omit<
  User,
  "password" | "createdAt" | "updatedAt" | "_id"
> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export type UserDTOPopulated = UserDTO & {
  student?: StudentDTO;
  staff?: StaffDTO;
};
