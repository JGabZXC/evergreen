import { User, UserDetail, Role } from "./User";

export interface Staff extends User {
  role: Role;
  details?: UserDetail;
  position?: string;
  department?: string;
  hireDate?: Date;
}

export interface Registrar extends Staff {
  role: Role.Registrar;
}
