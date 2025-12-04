import { Course } from "../../../domain/Course";

export type CourseDTO = Omit<Course, "_id" | "createdAt" | "updatedAt"> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
