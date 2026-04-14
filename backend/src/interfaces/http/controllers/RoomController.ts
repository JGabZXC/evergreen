import {Response} from "express";
import {IUseCase} from "../../../domain/common/IUseCase";
import {CreateRoomUseCaseRequest} from "../../../application/use-cases/room/ICreateRoomUseCase";
import {Room} from "../../../domain/entities/Room";
import {AuthenticatedRequest} from "../middleware/authGuard";
import {CreateRoomRequest, roomQuerySchema} from "../../../application/schemas/roomSchemas";
import {HttpStatus} from "../../../domain/enums/HttpStatus";
import {RoomMapper} from "../../../infrastructure/mapper/RoomMapper";
import {GetAllRoomFilter} from "../../../domain/interfaces/IRoomRepository";
import {BadRequestError} from "../middleware/HttpErrors";
import {GetAllRoomUseCaseRequest} from "../../../application/use-cases/room/IGetAllRoomUseCase";
import {PaginatedResult} from "../../../domain/common/Pagination";
import {GetRoomByIdUseCaseRequest} from "../../../application/use-cases/room/IGetRoomByIdUseCase";
import {RoomResponse, RoomResponseNested} from "../../../application/dto/RoomResponse";

export class RoomController {
    constructor(
        private readonly getAllRoomUseCase: IUseCase<GetAllRoomUseCaseRequest, PaginatedResult<RoomResponse | RoomResponseNested>>,
        private readonly getRoomByIdUseCase: IUseCase<GetRoomByIdUseCaseRequest, RoomResponse | RoomResponseNested>,
        private readonly createRoomUseCase: IUseCase<CreateRoomUseCaseRequest, Room>
    ) {
        this.createRoom = this.createRoom.bind(this);
        this.getAllRooms = this.getAllRooms.bind(this);
    }

    public async getAllRooms(req: AuthenticatedRequest, res: Response) {
        const filter: GetAllRoomFilter = {};
        const {data, success, error} = roomQuerySchema.safeParse(req.query);
        if(!success) throw new BadRequestError("Invalid query parameters", error);

        if (data?.name) filter.name = String(data.name);
        if (data?.type) filter.type = data.type;
        if (data?.capacity) filter.capacity = data.capacity
        if (data?.createdById) filter.createdById = data.createdById;
        if (data?.status) filter.status = data.status;

        const page = Number(data?.page) || 1;
        let limit = Number(data?.limit) || 10;

        if (
            page < 1 ||
            limit < 1 ||
            !Number.isInteger(page) ||
            !Number.isInteger(limit)
        ) {
            throw new BadRequestError(
                "Pagination parameters must be positive integers",
            );
        }

        if (limit > 100) limit = 100;

        const nested = data?.nested || false;

        const result = await this.getAllRoomUseCase.execute({filter, page, limit, nested});

        if (page !== 1 && page > result.meta.totalPages) throw new BadRequestError("Page number exceeds total pages");

        res.status(HttpStatus.OK).json(result);
    }

    public async getRoomById(req: AuthenticatedRequest, res: Response) {
        // roomId is validated through validateParams in route layer
        const {roomId} = req.params;
        const query = req.query;

        if(!roomId) throw new BadRequestError("Room ID is required");

        const request: GetRoomByIdUseCaseRequest = {
            roomId
        }

        if (query.nested) {
            request.nested = String(query.nested).toLowerCase() === "true";
        }

        const response = await this.getRoomByIdUseCase.execute(request);

        return res.status(HttpStatus.OK).json({
            data: response
        });
    }

    public async createRoom(req: AuthenticatedRequest<CreateRoomRequest>, res: Response) {
        const domainRoom = await this.createRoomUseCase.execute({
            data: req.body,
            createdById: req.user!.id
        });

        return res.status(HttpStatus.CREATED).json({
            data: RoomMapper.toResponseShallow(domainRoom)
        });
    }
}