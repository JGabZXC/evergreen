import { RoomResponse, RoomResponseNested } from "../../dto/RoomResponse";

export interface GetRoomByIdUseCaseRequest {
  roomId: string;
  nested?: boolean;
}

export interface IGetRoomByIdUseCase {
  execute(
    request: GetRoomByIdUseCaseRequest
  ): Promise<RoomResponse | RoomResponseNested>;
}