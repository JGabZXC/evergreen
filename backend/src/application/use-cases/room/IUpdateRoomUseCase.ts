import { UpdateRoomRequest } from "../../schemas/roomSchemas";

export interface UpdateRoomUseCaseRequest {
  roomId: string;
  data: UpdateRoomRequest & {
    remarks?: string | undefined;
    changedById?: string | undefined;
  };
}

export interface IUpdateRoomUseCase {
  execute(request: UpdateRoomUseCaseRequest): Promise<boolean>;
}