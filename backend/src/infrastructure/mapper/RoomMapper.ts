import {Room as PrismaRoom, User as PrismaUser} from "../../generated/prisma/client";
import {Room} from "../../domain/entities/Room";
import {UserMapper} from "./UserMapper";

interface WithRelation extends PrismaRoom {
    createdBy?: PrismaUser | null,
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
        };
    }
}