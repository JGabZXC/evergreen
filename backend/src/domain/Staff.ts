import { User, UserDetail, Role } from "./User";

export interface Staff extends User {
  role: Role.Staff;
  details?: UserDetail;
  position?: string;
  department?: string;
  hireDate?: Date;
}
