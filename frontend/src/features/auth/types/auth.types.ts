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

export interface User {
  _id: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;

  employeeId?: string;
  studentId?: string;
}

export interface AuthState {
  user: User | null;
}

export interface AuthResponse {
  user: User;
  studentId?: string;
  employeeId?: string;
}

export interface RefreshResponse extends AuthResponse {
  message: string;
}

export interface AuthContextType extends AuthState {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}
