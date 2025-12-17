import { SubjectTaken } from "../../../domain/SubjectTaken";
import { SubjectDTO } from "./SubjectDTO";

export type SubjectStatusDTO =
  | "Ongoing"
  | "Passed"
  | "Failed"
  | "Dropped"
  | "Credited"
  | "Withdrawn";

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
