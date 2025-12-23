import { SubjectSchedule, TimeSlot } from "../../../domain/SubjectSchedule";
import { RoomDTO } from "./RoomDTO";
import { SubjectDTO } from "./SubjectDTO";
import { StaffDTO } from "./StaffDTO";

export type TimeSlotDTO = Omit<TimeSlot, "_id" | "room"> & {
  _id: string;
  room: RoomDTO;
  teacher?: StaffDTO;
};

export type SubjectScheduleDTO = Omit<
  SubjectSchedule,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "subject"
  | "schedules"
> & {
  id: string;
  subject: SubjectDTO;
  schedules: TimeSlotDTO[];
  createdAt: string;
  updatedAt: string;
};
  teacher: {
    userId: UserDTO;
    staffId: string;
  };
};
