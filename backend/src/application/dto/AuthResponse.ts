import {UserResponse} from "./UserResponse";

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: UserResponse;
}