import {UpdateRoomRequest} from "../../schemas/roomSchemas";
import {IUseCase} from "../../../domain/common/IUseCase";

export interface UpdateRoomUseCaseRequest {
    roomId: string;
    data: UpdateRoomRequest & {
        remarks?: string | undefined,
        changedById?: string | undefined,
    };
}

export type IUpdateRoomUseCase = IUseCase<UpdateRoomUseCaseRequest, boolean>;