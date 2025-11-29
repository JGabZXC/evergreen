import { Schema, model } from "mongoose";
import { UserDetail } from "../../domain/User";

const UserDetailSchema = new Schema<UserDetail>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  profilePictureUrl: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
});

export const UserDetailModel = model<UserDetail>(
  "UserDetail",
  UserDetailSchema
);
