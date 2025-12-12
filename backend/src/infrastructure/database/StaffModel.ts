import mongoose, { Document, Schema } from "mongoose";
import { Staff } from "../../domain/Staff";

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

StaffSchema.index({ employeeId: 1, isActive: 1 });

StaffSchema.virtual("profile", {
  ref: "StaffProfile",
  localField: "employeeId",
  foreignField: "employeeId",
  justOne: true,
});

export const StaffModel = mongoose.model<Staff & Document>(
  "Staff",
  StaffSchema
);
