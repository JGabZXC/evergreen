import mongoose, { Document, Schema } from "mongoose";
import { BaseStudentProfile, GuardianDetails } from "../../domain/Student";
import { Address } from "../../domain/Staff";

const GuardianDetailsSchema = new Schema<GuardianDetails & Document>({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  relation: { type: String, required: true },
});

const AddressSchema = new Schema<Address & Document>({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: Number },
});

const StudentProfilesSchema = new Schema<BaseStudentProfile & Document>(
  {
    studentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String },
    address: { type: AddressSchema },
    guardianDetails: { type: GuardianDetailsSchema },
  },
  {
    timestamps: true,
  }
);

export const StudentProfileModel = mongoose.model<
  BaseStudentProfile & Document
>("StudentProfile", StudentProfilesSchema);
