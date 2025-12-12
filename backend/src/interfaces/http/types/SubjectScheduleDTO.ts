import { SubjectSchedule } from "../../../domain/SubjectSchedule";
import { SubjectDTO } from "./SubjectDTO";
import { UserDTO } from "./UserDTO";

export type SubjectScheduleDTO = Omit<
  SubjectSchedule,
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
