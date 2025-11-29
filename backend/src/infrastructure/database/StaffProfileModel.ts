import mongoose, { Schema } from "mongoose";
import { Address, BaseStaffProfile } from "../../domain/Staff";

const AddressSchema = new Schema<Address & Document>({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: Number },
});

const StaffSchema = new Schema<BaseStaffProfile & Document>({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  phoneNumber: { type: String },
  address: { type: AddressSchema },
  position: { type: String, required: true },
  department: { type: String, required: true },
  hireDate: { type: Date, required: true },
});

export const StaffProfileModel = mongoose.model<BaseStaffProfile & Document>(
  "StaffProfile",
  StaffSchema
);
