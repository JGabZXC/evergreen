import {GetRoomByIdUseCaseRequest, IGetRoomByIdUseCase} from "./IGetRoomByIdUseCase";
import {IRoomRepository} from "../../../domain/interfaces/IRoomRepository";
import {NotFoundError} from "../../../interfaces/http/middleware/HttpErrors";
import {RoomResponse, RoomResponseNested} from "../../dto/RoomResponse";
import {RoomMapper} from "../../../infrastructure/mapper/RoomMapper";

export class GetRoomByIdUseCase implements IGetRoomByIdUseCase {
    constructor(
        private readonly roomRepository: IRoomRepository,
    ) {}

    async execute(request: GetRoomByIdUseCaseRequest): Promise<RoomResponse | RoomResponseNested> {
        const {roomId, nested = false} = request;

        const roomDomain = await this.roomRepository.findById(roomId, nested);
        if (!roomDomain) throw new NotFoundError(`Room with id ${roomId} not found`);

        if (request.nested) {
            return RoomMapper.toResponseDeep(roomDomain);
        }

        return RoomMapper.toResponseShallow(roomDomain);
    }
}