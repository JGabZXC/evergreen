export enum Role {
  Student = "student",
  Teacher = "teacher",
  Admin = "admin",
  Staff = "staff",
  Registrar = "registrar",
  Approver = "approver",
}

export interface BaseUser {
  email: string;
  password: string;
  role: Role;
}

export interface User extends BaseUser {
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
