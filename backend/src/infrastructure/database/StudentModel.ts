import { Schema, model, Document } from "mongoose";
import { Student } from "../../domain/Student";

interface ParentContact {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface StudentDocument extends Student, Document {}

const ParentContactSchema = new Schema<ParentContact>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: String,
});

const StudentSchema = new Schema<StudentDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    birthday: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    address: String,
    gradeLevel: String,
    section: String,
    parentContact: { type: ParentContactSchema, required: true },
  },
  { timestamps: true }
);

export const StudentModel = model<StudentDocument>("Student", StudentSchema);
