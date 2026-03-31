import {Role} from "../../generated/prisma/enums";

export interface UserResponse {
    id: string;
    accountNumber: number,
    email: string;
    role: Role;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: UserResponse;
}