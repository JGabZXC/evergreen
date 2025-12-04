import { EnrollmentRecord } from "../../../domain/EnrollmentRecord";
import { SubjectTakenDTO } from "./SubjectTakenDTO";

export type ErollmentRecordDTO = Omit<
  EnrollmentRecord,
  "_id" | "createdAt" | "updatedAt" | "subjectTaken"
> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  subjectTaken?: SubjectTakenDTO[];
};

export interface TransferSectionDTO {
  studentId: string;
  newClassroomId: string;
}
