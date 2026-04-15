import {Prisma} from "../../generated/prisma/client";
import prisma from "../database/prisma/db";
import {GetAllRoomFilter, IRoomRepository} from "../../domain/interfaces/IRoomRepository";
import {CreateRoomRequest, UpdateRoomRequest} from "../../application/schemas/roomSchemas";
import {ConflictError, NotFoundError} from "../../interfaces/http/middleware/HttpErrors";
import {RoomMapper} from "../mapper/RoomMapper";
import {Room} from "../../domain/entities/Room";
import {PaginatedResult} from "../../domain/common/Pagination";

export class PrismaRoomRepository implements IRoomRepository {
    async getAll(filter: GetAllRoomFilter, page: number, limit: number, nested: boolean = false): Promise<PaginatedResult<Room>> {
        const skip = (page - 1) * limit;
        const where: Prisma.RoomWhereInput = {};

        if (filter.name) where.name = filter.name;
        if (filter.type) where.type = filter.type;
        if (filter.capacity) where.capacity = filter.capacity;
        if (filter.status) where.status = filter.status;
        if (filter.createdById) where.createdById = filter.createdById;

        const findArgs: Prisma.RoomFindManyArgs = {
            where,
            skip,
            take: limit,
            orderBy: {createdAt: "desc"},
        };

        if (nested) {
            findArgs.include = {
                createdBy: true,
            }
        }

        const [rawRooms, totalItems] = await Promise.all([
            prisma.room.findMany(findArgs),
            prisma.room.count({where})
        ]);

        const data = rawRooms.map(RoomMapper.toDomain);
        const totalPages = Math.ceil(totalItems/ limit);

        return {
            data,
            meta: {
                totalItems,
                itemCount: data.length,
                totalPages,
                currentPage: page,
            }
        }
    }

    async findById(roomId: string, nested: boolean = false): Promise<Room | null> {
        const include = {
            createdBy: true,
        }
       const rawRoom =  await prisma.room.findUnique({
            where: {id: roomId},
           ...(nested ? { include } : {}),
        });

        if(!rawRoom) return null;

        return RoomMapper.toDomain(rawRoom);

    }

    async create(data: CreateRoomRequest, createdById: string): Promise<Room> {
        try {
            const rawRoom = await prisma.room.create({
                data: {
                    name: data.name,
                    type: data.type,
                    capacity: data.capacity,
                    status: data.status,
                    createdById,
                }
            });

            return RoomMapper.toDomain(rawRoom);
        } catch(error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new ConflictError("Room with this name is already in use", error.message);
            }
            throw error;
        }
    }

    async update(data: UpdateRoomRequest, roomId: string): Promise<boolean> {
        const updateData: Prisma.RoomUpdateInput = {}

        if (data.name !== undefined) {
            updateData.name = data.name;
        }

        if (data.type !== undefined) {
            updateData.type = data.type;
        }

        if (data.capacity !== undefined) {
            updateData.capacity = data.capacity;
        }

        if (data.status !== undefined) {
            updateData.status = data.status;
        }

        try {
            await prisma.room.update({
                where: {
                    id: roomId
                },
                data: updateData,
            });

            return true;
        } catch(error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new ConflictError("Room with this name is already in use");
            }

            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P2025") {
                throw new NotFoundError(`Room with id ${roomId} not found`);
            }

            throw error;
        }
    }
}