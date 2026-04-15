import {UpdateRoomRequest} from "../../schemas/roomSchemas";
import {IUseCase} from "../../../domain/common/IUseCase";

export interface UpdateRoomUseCaseRequest {
    roomId: string;
    data: UpdateRoomRequest;
}

export type IUpdateRoomUseCase = IUseCase<UpdateRoomUseCaseRequest, boolean>;