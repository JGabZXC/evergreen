import { CreateRoomRequest } from "../../schemas/roomSchemas";
import { Room } from "../../../domain/entities/Room";

export interface CreateRoomUseCaseRequest {
  data: CreateRoomRequest;
  createdById: string;
}

export interface ICreateRoomUseCase {
  execute(request: CreateRoomUseCaseRequest): Promise<Room>;
}