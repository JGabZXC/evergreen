import { User, UserDetail, Role } from "./User";

export interface Approver extends User {
  role: Role.Approver;
  details: UserDetail;
  department: string;
  hireDate: Date;
}
