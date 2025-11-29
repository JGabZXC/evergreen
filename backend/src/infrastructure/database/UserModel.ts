import { Schema, model } from "mongoose";
import { Role, User } from "../../domain/User";

const UserSchema = new Schema<User & Document>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
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

UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    const { __v, password, ...userObject } = ret;
    return userObject;
  },
});

export const UserModel = model<User & Document>("User", UserSchema);
