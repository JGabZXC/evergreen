import { EnrollmentRecord } from "../../../domain/EnrollmentRecord";
import { GradeLevel } from "../../../domain/Subject";
import { SubjectStatus, SubjectTaken } from "../../../domain/SubjectTaken";
import { Semester } from "../../../domain/types/Semester";
import { SubjectTakenDTO } from "./SubjectTakenDTO";

export type ErollmentRecordDTO = Omit<
  EnrollmentRecord,
  "_id" | "createdAt" | "updatedAt" | "subjectTaken"
> & {
  _id: string; // Optional for DTOs
  createdAt: Date; // Optional for DTOs
  updatedAt: Date; // Optional for DTOs
  subjectTaken?: SubjectTakenDTO[];
};

export interface TransferSectionDTO {
  studentId: string;
  newClassroomId: string;
}
