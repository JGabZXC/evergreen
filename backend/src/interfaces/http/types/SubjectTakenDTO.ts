import { SubjectTaken } from "../../../domain/SubjectTaken";
import { SubjectDTO } from "./SubjectDTO";

export type SubjectStatusDTO =
  | "enrolled"
  | "passed"
  | "failed"
  | "dropped"
  | "credited";

export type SubjectTakenDTO = Omit<
  SubjectTaken,
  "_id" | "createdAt" | "updatedAt" | "status" | "subject"
> & {
  _id: string;
  subject: SubjectDTO;
  status: SubjectStatusDTO;
  createdAt: Date;
  updatedAt: Date;
};
