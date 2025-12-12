import { RoomModel } from "../../../infrastructure/database/RoomModel";
import { RoomDTO } from "../../../interfaces/http/types/RoomDTO";

export class GetRoomUsecase {
  async execute(roomId: string) {
    return await RoomModel.findById(roomId).lean<RoomDTO>();
  }
}
