import { User } from "../../../domain/User";

export type UserDTO = Omit<
  User,
  "password" | "createdAt" | "updatedAt" | "_id"
> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
