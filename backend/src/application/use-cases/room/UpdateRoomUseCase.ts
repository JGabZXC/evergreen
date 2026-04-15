import {IUpdateRoomUseCase, UpdateRoomUseCaseRequest} from "./IUpdateRoomUseCase";
import {IRoomRepository} from "../../../domain/interfaces/IRoomRepository";

export class UpdateRoomUseCase implements IUpdateRoomUseCase {
    constructor(
        private readonly roomRepository: IRoomRepository,
    ) {}

    async execute(request: UpdateRoomUseCaseRequest): Promise<boolean> {
        const {data, roomId} = request;

        return await this.roomRepository.update(data, roomId)
    }
}