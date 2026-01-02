import mongoose, { Schema, Document } from "mongoose";
import { SchoolYear, SchoolYearStatus } from "../../domain/SchoolYear";
import { Semester } from "../../domain/types/Semester";

const TermPeriodSchema = new Schema({
  semester: {
    type: Number,
    enum: Object.values(Semester).filter((v) => typeof v === "number"),
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

const SchoolYearSchema = new Schema<SchoolYear & Document>(
  {
    year: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: SchoolYearStatus,
      default: SchoolYearStatus.Upcoming,
    },
    terms: {
      college: [TermPeriodSchema],
      k12: [TermPeriodSchema],
    },
  },
  { timestamps: true }
);

export const SchoolYearModel = mongoose.model<SchoolYear & Document>(
  "SchoolYear",
  SchoolYearSchema
);
