import {UserResponse} from "./UserResponse";
import {UserProfileResponse} from "./UserProfileResponse";

export interface UserAdminResponse extends UserResponse {
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserAdminResponseDeep {
    user: UserAdminResponse,
    userProfile: UserProfileResponse | null;
}