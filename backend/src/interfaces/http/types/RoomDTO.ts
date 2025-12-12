import { Room } from "../../../domain/Room";

export type RoomDTO = Omit<Room, "_id" | "createdAt" | "updatedAt"> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
