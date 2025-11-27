import { User, UserDetail, Role } from "./User";

export interface Registrar extends User {
  role: Role.Registrar;
  details?: UserDetail;
  officeLocation?: string;
  hireDate?: Date;
  managedPrograms?: string[];
}
