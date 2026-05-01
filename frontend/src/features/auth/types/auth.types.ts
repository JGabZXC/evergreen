export enum Role {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
  REGISTRAR = "REGISTRAR"
}

export interface User {
  id: string;
  accountNumber: number;
  email: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
}

export type AuthResponse = User;
export type RefreshResponse = User;

export interface AuthContextType extends AuthState {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}
