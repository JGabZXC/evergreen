import { Role } from "./Role";

export interface AuthPayload {
  _id: string;
  email: string;
  role: Role;
  studentId?: string;
  employeeId?: string;
  iat?: number;
  exp?: number;
}
