import mongoose, { Schema, Document } from "mongoose";
import { Classroom } from "../../domain/Classroom";
import { GradeLevel } from "../../domain/Subject";

const ClassroomSchema = new Schema<Classroom & Document>(
  {
    adviserId: { type: String, required: true },
    name: { type: String, required: true },
    gradeLevel: {
      type: String,
      enum: Object.values(GradeLevel),
      required: true,
    },
    capacity: { type: Number, required: true },
    currentCapacity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ClassroomModel = mongoose.model<Classroom & Document>(
  "Classroom",
  ClassroomSchema
);
