import { SubjectSchedule, TimeSlot } from "../../../domain/SubjectSchedule";
import { RoomDTO } from "./RoomDTO";
import { SubjectDTO } from "./SubjectDTO";
import { UserDTO } from "./UserDTO";

export type TimeSlotDTO = Omit<TimeSlot, "_id" | "room"> & {
  _id: string;
  room: RoomDTO;
};

export type SubjectScheduleDTO = Omit<
  SubjectSchedule,
  "_id" | "createdAt" | "updatedAt" | "subject" | "teacher" | "schedules"
> & {
  id: string;
  subject: SubjectDTO;
  schedules: TimeSlotDTO[];
  teacher: {
    userId: UserDTO;
    staffId: string;
  };
  createdAt: string;
  updatedAt: string;
};
