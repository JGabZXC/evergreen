import mongoose from "mongoose";
import { BaseRoom } from "../../../domain/Room";
import { RoomModel } from "../../../infrastructure/database/RoomModel";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class CreateRoomUseCase {
  async execute(roomData: BaseRoom, session?: mongoose.ClientSession) {
    try {
      const [createdRoom] = await RoomModel.create([roomData], {
        session: session || null,
      });

      return createdRoom;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictError("Room already exists", err.keyValue);
      }
      throw err;
    }
  }
}
