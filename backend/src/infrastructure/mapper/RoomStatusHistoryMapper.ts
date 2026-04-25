import {RoomStatusHistory as PrismaRoomStatusHistory, User as PrismaUser} from "../../generated/prisma/client";
import {RoomStatusHistory} from "../../domain/entities/RoomStatusHistory";
import {UserMapper} from "./UserMapper";

interface WithRelations extends PrismaRoomStatusHistory {
    changedBy?: PrismaUser | null;
}

export class RoomStatusHistoryMapper {
    static toDomain(raw: WithRelations) {
        return new RoomStatusHistory(
            raw.id,
            raw.roomId,
            raw.previousStatus,
            raw.newStatus,
            raw.remarks,
            raw.changedById,
            raw.createdAt,

            // NESTED PROPERTIES
            raw.changedBy ? UserMapper.toDomain(raw.changedBy) : null,
        );
    }

    static toResponseShallow(domain: RoomStatusHistory) {
        return {
            id: domain.id,
            roomId: domain.roomId,
            previousStatus: domain.previousStatus,
            newStatus: domain.newStatus,
            remarks: domain.remarks,
            changedById: domain.changedById,
            createdAt: domain.createdAt,
        }
    }

    static toResponseDeep(domain: RoomStatusHistory) {
        return {
            ...RoomStatusHistoryMapper.toResponseShallow(domain),

            // NESTED PROPERTIES
            changedBy: domain.changedBy ? UserMapper.toResponseDeep(domain.changedBy) : null,
        }
    }
}