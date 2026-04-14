import {CreateRoomRequest, UpdateRoomRequest} from "../../application/schemas/roomSchemas";
import {Room} from "../entities/Room";
import {PaginatedResult} from "../common/Pagination";
import {RoomStatus, RoomType} from "../../generated/prisma/enums";

export interface GetAllRoomFilter {
    name?: string,
    type?: RoomType,
    capacity?: number,
    createdById?: string,
    status?: RoomStatus
}

export interface IRoomRepository {
    getAll(filter: GetAllRoomFilter, page: number, limit: number, nested: boolean): Promise<PaginatedResult<Room>>;
    findById(roomId: string, nested: boolean): Promise<Room | null>
    create(data: CreateRoomRequest, createdById: string): Promise<Room>;
    update(data: UpdateRoomRequest, roomId: string): Promise<boolean>;
}