import { SubjectSchedule, TimeSlot } from "../../../domain/SubjectSchedule";
import { RoomDTO } from "./RoomDTO";
import { SubjectDTO } from "./SubjectDTO";
import { UserDTO } from "./UserDTO";

import { SectionDTO } from "./SectionDTO";

export type TimeSlotDTO = Omit<TimeSlot, "_id" | "room"> & {
  _id: string;
  room: RoomDTO;
};

export type SubjectScheduleDTO = Omit<
  SubjectSchedule,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "subject"
  | "teacher"
  | "schedules"
  | "sectionId"
> & {
  id: string;
  subject: SubjectDTO;
  section?: SectionDTO;
  schedules: TimeSlotDTO[];
  createdAt: string;
  updatedAt: string;

  // VIRTUALS
  teacher: {
    userId: UserDTO;
    staffId: string;
  };
};
