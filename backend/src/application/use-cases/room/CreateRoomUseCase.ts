import mongoose from "mongoose";
import { BaseRoom } from "../../../domain/Room";
import { RoomModel } from "../../../infrastructure/database/RoomModel";

export class CreateRoomUseCase {
  async execute(roomData: BaseRoom, session?: mongoose.ClientSession) {
    const createdRoom = await RoomModel.create([roomData], {
      session: session || null,
    });

    return createdRoom[0];
  }
}
