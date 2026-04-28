import {UserResponse} from "./UserResponse";
import {UserProfile} from "../../domain/entities/UserProfile";

export interface UserAdminResponse extends UserResponse {
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserAdminResponseDeep {
    user: UserAdminResponse,
    userProfile: UserProfile | null;
}