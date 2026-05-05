import { GetAllRoomFilter } from "../../../domain/interfaces/IRoomRepository";
import { PaginatedResult } from "../../../domain/common/Pagination";
import { RoomResponse, RoomResponseNested } from "../../dto/RoomResponse";

export interface GetAllRoomUseCaseRequest {
  filter: GetAllRoomFilter;
  page: number;
  limit: number;
  nested: boolean;
}

export interface IGetAllRoomUseCase {
  execute(
    request: GetAllRoomUseCaseRequest
  ): Promise<PaginatedResult<RoomResponse | RoomResponseNested>>;
}