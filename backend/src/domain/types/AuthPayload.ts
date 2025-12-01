import { Role } from "./Role";

export interface AuthPayload {
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
