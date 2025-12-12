import mongoose, { Schema } from "mongoose";
import { Room, RoomStatus, RoomType } from "../../domain/Room";

const RoomSchema = new Schema<Room & Document>(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(RoomType), required: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: Object.values(RoomStatus), required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RoomModel = mongoose.model<Room & Document>("Room", RoomSchema);
