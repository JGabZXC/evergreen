import {Response} from "express";
import {AuthResponse} from "../../application/dto/AuthResponse";
import {UserCreateRequest} from "../../application/dto/UserCreateRequest";
import {User} from "../entities/User";

export interface IAuthService {
    login(identifier: string, password: string): Promise<AuthResponse>;
    create(data: UserCreateRequest, creatorId: string): Promise<User | undefined>;
    logout(res: Response): Promise<void>;
    refreshToken(oldRefreshToken: string): Promise<AuthResponse>;
}