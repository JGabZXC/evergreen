import { Classroom } from "../../../domain/Classroom";

export type ClassroomDTO = Omit<
  Classroom,
  "_id" | "createdAt" | "updatedAt"
> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
