import { Room } from "../../../domain/Room";
import { Section } from "../../../domain/Section";

export type SectionDTO = Omit<
  Section,
  "_id" | "createdAt" | "updatedAt" | "designatedRoom"
> & {
  _id: string;
  designatedRoom?: Room;
  createdAt: string;
  updatedAt: string;
};
