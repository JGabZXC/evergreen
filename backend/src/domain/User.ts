import { Schema } from "mongoose";
import { Role } from "./types/Role";

export interface BaseUser {
  email: string;
  password: string;
  role: Role;
}

export interface User extends BaseUser {
  _id: Schema.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
