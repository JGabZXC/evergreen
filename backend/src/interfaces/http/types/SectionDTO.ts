import { RoomDTO } from "./RoomDTO";
import { Section } from "../../../domain/Section";
import { StaffDTO } from "./StaffDTO";

export type SectionDTO = Omit<
  Section,
  "_id" | "createdAt" | "updatedAt" | "designatedRoom"
> & {
  _id: string;
  designatedRoom?: RoomDTO;
  createdAt: string;
  updatedAt: string;
};

export type PopulatedSectionDTO = Omit<SectionDTO, "adviserId"> & {
  adviserId?: StaffDTO | string;
};
