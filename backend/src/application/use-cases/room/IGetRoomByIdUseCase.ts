import {IUseCase} from "../../../domain/common/IUseCase";
import {RoomResponse, RoomResponseNested} from "../../dto/RoomResponse";

export interface GetRoomByIdUseCaseRequest {
    roomId: string;
    nested?: boolean;
}

export type IGetRoomByIdUseCase = IUseCase<GetRoomByIdUseCaseRequest, RoomResponse | RoomResponseNested>;
