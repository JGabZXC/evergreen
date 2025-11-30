import { Schema, model } from "mongoose";
import { User } from "../../domain/User";
import { StaffRole, StudentRole } from "../../domain/types/Role";

const UserSchema = new Schema<User & Document>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [...Object.values(StudentRole), ...Object.values(StaffRole)],
      default: StudentRole.Student,
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    const { __v, password, ...userObject } = ret;
    return userObject;
  },
});

export const UserModel = model<User & Document>("User", UserSchema);
