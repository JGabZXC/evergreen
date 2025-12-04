import { SubjectTaken } from "../../../domain/SubjectTaken";

export type SubjectStatusDTO =
  | "enrolled"
  | "passed"
  | "failed"
  | "dropped"
  | "credited";

export type SubjectTakenDTO = Omit<
  SubjectTaken,
  "_id" | "createdAt" | "updatedAt" | "status"
> & {
  _id: string;
  status: SubjectStatusDTO;
  createdAt: Date;
  updatedAt: Date;
};
