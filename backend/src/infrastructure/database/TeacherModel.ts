import { Schema, model, Document } from "mongoose";
import { Teacher } from "../../domain/Teacher";

interface TeacherDocument extends Teacher, Document {}

const TeacherSchema = new Schema<TeacherDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    birthday: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    address: String,
    subjectSpecialization: [String],
    contactNumber: String,
    email: String,
  },
  { timestamps: true }
);

export const TeacherModel = model<TeacherDocument>("Teacher", TeacherSchema);
