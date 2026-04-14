import {CreateRoomRequest} from "../../schemas/roomSchemas";
import {IUseCase} from "../../../domain/common/IUseCase";
import {Room} from "../../../domain/entities/Room";

export interface CreateRoomUseCaseRequest {
    data: CreateRoomRequest,
    createdById: string,
}

export type ICreateRoomUseCase = IUseCase<CreateRoomUseCaseRequest, Room>;