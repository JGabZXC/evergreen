import mongoose, { Document, Schema } from "mongoose";
import { Staff } from "../../domain/Staff";

const StaffSchema = new Schema<Staff & Document>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  employeeId: { type: String, required: true, unique: true },
});

export const StaffModel = mongoose.model<Staff & Document>(
  "Staff",
  StaffSchema
);
