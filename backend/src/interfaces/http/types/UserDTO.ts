import { User } from "../../../domain/User";

export type UserDTO = Omit<
  User,
  "password" | "createdAt" | "updatedAt" | "_id"
> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
