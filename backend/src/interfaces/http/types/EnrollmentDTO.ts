import { EnrollmentRecord } from "../../../domain/EnrollmentRecord";
import { SectionDTO } from "./SectionDTO";
import { SubjectTakenDTO } from "./SubjectTakenDTO";

export type ErollmentRecordDTO = Omit<
  EnrollmentRecord,
  "_id" | "createdAt" | "updatedAt" | "section"
> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  section?: string;
  subjectTaken?: SubjectTakenDTO[];
};

export type PopulatedEnrollmentRecordDTO = Omit<
  ErollmentRecordDTO,
  "section"
> & {
  section?: SectionDTO | string;
};

export interface TransferSectionDTO {
  studentId: string;
  newClassroomId: string;
}
