import {GetAllRoomFilter} from "../../../domain/interfaces/IRoomRepository";
import {IUseCase} from "../../../domain/common/IUseCase";
import {PaginatedResult} from "../../../domain/common/Pagination";
import {RoomResponse, RoomResponseNested} from "../../dto/RoomResponse";

export interface GetAllRoomUseCaseRequest {
    filter: GetAllRoomFilter,
    page: number,
    limit: number,
    nested: boolean,
}

export type IGetAllRoomUseCase = IUseCase<GetAllRoomUseCaseRequest, PaginatedResult<RoomResponse | RoomResponseNested>>;