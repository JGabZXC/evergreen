import { Subject } from "../../../domain/Subject";
import { UserDTO } from "./UserDTO";

export type SubjectDTO = Omit<
  Subject,
  "_id" | "createdBy" | "createdAt" | "updatedAt"
> & {
  _id: string;
  createdBy: UserDTO;
  createdAt: string;
  updatedAt: string;
};
