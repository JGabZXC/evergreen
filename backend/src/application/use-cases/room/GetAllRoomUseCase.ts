import {GetAllRoomUseCaseRequest, IGetAllRoomUseCase} from "./IGetAllRoomUseCase";
import {IRoomRepository} from "../../../domain/interfaces/IRoomRepository";
import {RoomMapper} from "../../../infrastructure/mapper/RoomMapper";
import {PaginatedResult} from "../../../domain/common/Pagination";
import {RoomResponse, RoomResponseNested} from "../../dto/RoomResponse";

export class GetAllRoomUseCase implements IGetAllRoomUseCase {
    constructor(
        private readonly roomRepository: IRoomRepository,
        ) {}

    async execute(request: GetAllRoomUseCaseRequest): Promise<PaginatedResult<RoomResponse | RoomResponseNested>> {
        const result = await this.roomRepository.getAll(request.filter, request.page, request.limit, request.nested);

        console.log(result);

        const data = request.nested ?
            result.data.map(RoomMapper.toResponseDeep) :
            result.data.map(RoomMapper.toResponseShallow)

        return {
            data,
            meta: result.meta
        }
    }
}