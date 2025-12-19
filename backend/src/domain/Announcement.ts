import { Schema } from "mongoose";
import { PopulatedStaffDTO } from "../interfaces/http/types/StaffDTO";

export interface BaseAnnouncement {
  title: string;
  content: string;
  authorId: string; // Teacher/Staff ID
  targetSectionId?: Schema.Types.ObjectId; // Optional: if specific to a section
  isImportant: boolean;
  academicYear: string;
  semester: string;

  // VIRTUALS
  author?: PopulatedStaffDTO;
}

export interface Announcement extends BaseAnnouncement {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
