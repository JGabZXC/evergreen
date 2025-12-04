import { Subject } from "../../../domain/Subject";
import { StaffDTO } from "./StaffDTO";
import { UserDTO } from "./UserDTO";

export type SubjectDTO = Omit<
  Subject,
  "_id" | "createdBy" | "createdAt" | "updatedAt" | "teacher"
> & {
  _id: string;
  teacher?: StaffDTO;
  createdBy: UserDTO;
  createdAt: string;
  updatedAt: string;
};
