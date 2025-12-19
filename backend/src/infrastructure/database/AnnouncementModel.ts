import mongoose, { Schema, Document } from "mongoose";
import { Announcement } from "../../domain/Announcement";

const AnnouncementSchema = new Schema<Announcement & Document>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    targetSectionId: { type: Schema.Types.ObjectId, ref: "Section" },
    isImportant: { type: Boolean, default: false },
    academicYear: { type: String, required: true },
    semester: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AnnouncementSchema.virtual("author", {
  ref: "Staff",
  localField: "authorId",
  foreignField: "employeeId",
  justOne: true,
});

export const AnnouncementModel = mongoose.model<Announcement & Document>(
  "Announcement",
  AnnouncementSchema
);
