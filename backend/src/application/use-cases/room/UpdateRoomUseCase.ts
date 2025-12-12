import mongoose from "mongoose";
import { BaseRoom } from "../../../domain/Room";
import { RoomModel } from "../../../infrastructure/database/RoomModel";

export class UpdateRoomUseCase {
  async execute(
    roomId: string,
    data: Partial<BaseRoom>,
    session?: mongoose.ClientSession
  ) {
    return await RoomModel.findByIdAndUpdate(roomId, data, {
      new: true,
      session: session || null,
    }).lean<BaseRoom>();
  }
}
