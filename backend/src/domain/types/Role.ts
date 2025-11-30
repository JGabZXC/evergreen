export enum StudentRole {
  Student = "student",
}

export enum StaffRole {
  Teacher = "teacher",
  Admin = "admin",
  Staff = "staff",
  Registrar = "registrar",
  Approver = "approver",
}

export type Role = StudentRole | StaffRole;
