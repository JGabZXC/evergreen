import { Schema, model, Document } from "mongoose";
import { Staff } from "../../domain/Staff";

interface StaffDocument extends Staff, Document {}

const StaffSchema = new Schema<StaffDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    birthday: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    address: String,
    position: String,
    contactNumber: String,
    email: String,
  },
  { timestamps: true }
);

export const StaffModel = model<StaffDocument>("Staff", StaffSchema);
