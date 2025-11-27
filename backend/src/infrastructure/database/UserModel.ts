import { Schema, model, Document } from "mongoose";
import { Role, User } from "../../domain/User";

interface UserDocument extends User, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.Student,
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>("User", UserSchema);
