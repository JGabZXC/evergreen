import mongoose, { Schema } from "mongoose";
import { Address, StaffProfile } from "../../domain/Staff";

const AddressSchema = new Schema<Address & Document>({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: Number },
});

const StaffProfileSchema = new Schema<StaffProfile & Document>(
  {
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String },
    address: { type: AddressSchema },
    department: { type: String, required: true },
    hireDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

StaffProfileSchema.virtual("staff", {
  ref: "Staff",
  localField: "employeeId",
  foreignField: "employeeId",
  justOne: true,
});

export const StaffProfileModel = mongoose.model<StaffProfile & Document>(
  "StaffProfile",
  StaffProfileSchema
);
