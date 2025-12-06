import { ClassSchedule } from "../../../domain/ClassSchedule";
import { SubjectDTO } from "./SubjectDTO";
import { UserDTO } from "./UserDTO";

export type ClassScheduleDTO = Omit<
  ClassSchedule,
  "_id" | "createdAt" | "updatedAt" | "subject" | "teacher"
> & {
  id: string;
  subject: SubjectDTO;
  teacher: {
    userId: UserDTO;
    staffId: string;
  };
  createdAt: string;
  updatedAt: string;
};
