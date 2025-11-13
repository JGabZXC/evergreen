import { Schema, model, Document } from "mongoose";
import { Admin } from "../../domain/Admin";

interface AdminDocument extends Admin, Document {}

const AdminSchema = new Schema<AdminDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const AdminModel = model<AdminDocument>("Admin", AdminSchema);
