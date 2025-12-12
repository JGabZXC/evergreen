import mongoose, { Schema, Document } from "mongoose";
import { Section } from "../../domain/Section";
import { GradeLevel } from "../../domain/types/GradeLevel";

const SectionSchema = new Schema<Section & Document>(
  {
    adviserId: { type: String, required: true },
    name: { type: String, required: true },
    gradeLevel: {
      type: String,
      enum: Object.values(GradeLevel),
      required: true,
    },
    schoolYear: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentCapacity: { type: Number, default: 0 },
    designatedRoom: { type: Schema.Types.ObjectId, ref: "Room" },
  },
  { timestamps: true }
);

SectionSchema.index(
  { name: 1, gradeLevel: 1, schoolYear: 1 },
  { unique: true }
);

export const SectionModel = mongoose.model<Section & Document>(
  "Section",
  SectionSchema
);
