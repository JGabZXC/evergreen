import {Room as PrismaRoom, User as PrismaUser, RoomStatusHistory as PrismaRoomStatusHistory} from "../../generated/prisma/client";
import {Room} from "../../domain/entities/Room";
import {UserMapper} from "./UserMapper";
import {RoomStatusHistoryMapper} from "./RoomStatusHistoryMapper";

interface WithRelation extends PrismaRoom {
    createdBy?: PrismaUser | null,
    roomStatusHistories?: PrismaRoomStatusHistory[] | null,
}

export class RoomMapper {
    static toDomain(raw: WithRelation) {
        return new Room(
            raw.id,
            raw.name,
            raw.type,
            raw.capacity,
            raw.status,
            raw.createdById,
            raw.createdAt,
            raw.updatedAt,

            // NESTED PROPERTIES
            raw.createdBy ? UserMapper.toDomain(raw.createdBy) : null,
            raw.roomStatusHistories ? raw.roomStatusHistories.map(RoomStatusHistoryMapper.toDomain) : null,
        );
    }

    static toResponseShallow(domain: Room) {
        return {
            id: domain.id,
            name: domain.name,
            type: domain.type,
            capacity: domain.capacity,
            status: domain.status,
            createdById: domain.createdById,
            createdAt: domain.createdAt.toISOString(),
            updatedAt: domain.updatedAt.toISOString(),
        }
    }

    static toResponseDeep(domain: Room) {
        return {
            ...RoomMapper.toResponseShallow(domain),

            // NESTED PROPERTIES
            createdBy: domain.createdBy ? UserMapper.toResponseDeep(domain.createdBy) : null,
            roomStatusHistories: domain.roomStatusHistories ? domain.roomStatusHistories.map(RoomStatusHistoryMapper.toResponseDeep) : null,
        };
    }
}