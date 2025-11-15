export interface User {
  email: string;
  password: string;
  role: "student" | "teacher" | "admin" | "staff";
  createdAt?: Date;
  updatedAt?: Date;
}
