import mongoose, { Schema } from "mongoose";
import { Student } from "../../domain/Student";

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: Number, required: true },
  },
  { _id: false }
);

const GuardianDetailsSchema = new Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    relation: { type: String, required: true },
  },
  { _id: false }
);

const StudentProfileSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String },
    address: { type: AddressSchema },
    guardianDetails: { type: GuardianDetailsSchema },
  },
  { _id: false }
);

const StudentSchema = new Schema<Student & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: { type: String, required: true, unique: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    isActive: { type: Boolean, default: true },
    profile: { type: StudentProfileSchema },
  },
  {
    timestamps: true,
  }
);

StudentSchema.index({ studentId: 1, isActive: 1 });

export const StudentModel = mongoose.model<Student & Document>(
  "Student",
  StudentSchema
);
