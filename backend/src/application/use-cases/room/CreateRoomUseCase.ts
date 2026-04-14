import {CreateRoomUseCaseRequest, ICreateRoomUseCase} from "./ICreateRoomUseCase";
import {IRoomRepository} from "../../../domain/interfaces/IRoomRepository";

export class CreateRoomUseCase implements ICreateRoomUseCase {
    constructor(
        private readonly roomRepository: IRoomRepository,
    ) {}

    async execute(request: CreateRoomUseCaseRequest) {
        return await this.roomRepository.create(request.data, request.createdById);
    }

}