import {Role} from "../../generated/prisma/enums";

export interface AuthPayload {
  id: string;
  accountNumber: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
