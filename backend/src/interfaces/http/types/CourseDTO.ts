import { Course, CurriculumItem } from "../../../domain/Course";
import { SubjectDTO } from "./SubjectDTO";

export type CurriculumItemDTO = Omit<CurriculumItem, "_id" | "subject"> & {
  _id: string;
  subject: SubjectDTO[];
};

export type CourseDTO = Omit<
  Course,
  "_id" | "createdAt" | "updatedAt" | "curriculum"
> & {
  id: string;
  curriculum: CurriculumItemDTO[];
  createdAt: string;
  updatedAt: string;
};
