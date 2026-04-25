import {CreateRoomRequest, UpdateRoomRequest} from "../../application/schemas/roomSchemas";
import {Room} from "../entities/Room";
import {PaginatedResult} from "../common/Pagination";
import {RoomStatus, RoomType} from "../../generated/prisma/enums";
import {RoomStatusHistory} from "../../generated/prisma/client";

export interface GetAllRoomFilter {
    name?: string,
    type?: RoomType,
    capacity?: number,
    createdById?: string,
    status?: RoomStatus
}

export interface CreateRoomHistoryRequest {
    roomId: string;
    previousStatus: RoomStatus;
    newStatus: RoomStatus;
    remarks?: string | null;
    changedById?: string | null;
}

export interface IRoomRepository {
    getAll(filter: GetAllRoomFilter, page: number, limit: number, nested: boolean): Promise<PaginatedResult<Room>>;
    findById(roomId: string, nested?: boolean): Promise<Room | null>
    create(data: CreateRoomRequest, createdById: string): Promise<Room>;
    update(data: UpdateRoomRequest, roomId: string): Promise<boolean>;
    createStatusHistory(request: CreateRoomHistoryRequest): Promise<RoomStatusHistory>;
}