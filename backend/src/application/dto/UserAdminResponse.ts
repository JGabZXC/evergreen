import {UserResponse} from "./UserResponse";

export interface UserAdminResponse extends UserResponse {
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}