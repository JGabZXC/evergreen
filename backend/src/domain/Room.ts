import { Schema } from "mongoose";

export enum RoomType {
  Lecture = "Lecture",
  Laboratory = "Laboratory",
  ComputerLab = "Computer Lab",
  Gymnasium = "Gymnasium",
}

export enum RoomStatus {
  Open = "Open",
  UnderMaintenance = "Under Maintenance",
}

export interface BaseRoom {
  name: string; // e.g., "Room 101"
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  isActive: boolean;
}

export interface Room extends BaseRoom {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
