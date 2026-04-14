import {UserResponse} from "./UserResponse";

export interface RoomResponse {
    id: string;
    name: string;
    type: string;
    capacity: number;
    status: string;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface RoomResponseNested extends RoomResponse {
    createdBy: UserResponse | null;
}