import mongoose, { Document, Schema } from "mongoose";
import { BaseStaff, Staff } from "../../domain/Staff";

const StaffSchema = new Schema<Staff & Document>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    employeeId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

StaffSchema.virtual("formattedId").get(function () {
  if (
    typeof this.employeeId === "string" &&
    this.employeeId.startsWith("EMP-")
  ) {
    const num = this.employeeId.split("-")[1] || "1";
    return `EMP-${num.padStart(9, "0")}`;
  }
  return this.employeeId;
});

export const StaffModel = mongoose.model<Staff & Document>(
  "Staff",
  StaffSchema
);
