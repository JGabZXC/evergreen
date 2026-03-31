import {Response} from "express";
import {IAuthService} from "../../domain/interfaces/IAuthService";
import {IUserRepository} from "../../domain/interfaces/IUserRepository";
import {ITokenService} from "../../domain/interfaces/ITokenService";
import bcrypt from "bcrypt"
import {BadRequestError, NotFoundError} from "../../interfaces/http/middleware/HttpErrors";
import {UserMapper} from "../../infrastructure/mapper/UserMapper";
import {AuthResponse} from "../dto/AuthResponse";
import {UserCreateRequest} from "../dto/UserCreateRequest";
import {User} from "../../domain/entities/User";
import {Prisma} from "../../generated/prisma/client";

export class AuthService implements IAuthService {
    private readonly SALT_ROUNDS = 12
    constructor(
        private readonly tokenService: ITokenService,
        private readonly userRepository: IUserRepository
    ) {}

    public async login(identifier: string, password: string): Promise<AuthResponse> {
        const rawUser = await this.userRepository.findRawByAccountNumberOrEmail(identifier)
        if (!rawUser) throw new NotFoundError("User not found");

        if(await this.isCorrectPassword(rawUser.password, password)) throw new BadRequestError("Invalid credentials")

        const normalizedUser = UserMapper.toDomain(rawUser).toObjectSimple()
        const access_token = this.tokenService.generateAccessTokens(normalizedUser)
        const refresh_token = this.tokenService.generateRefreshTokens(normalizedUser)

        return {
            access_token,
            refresh_token,
            user: normalizedUser,
        };
    }

    public async logout(res: Response): Promise<void> {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
    }

    public async create(data: UserCreateRequest, creatorId: string): Promise<User | undefined> {
        try {
            return await this.userRepository.create(data, creatorId);
        } catch(err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
                throw new BadRequestError("User already exists");
            }

            throw err;
        }
    }

    public async refreshToken(oldRefreshToken:string): Promise<AuthResponse> {
        const payload = this.tokenService.verifyRefreshToken(oldRefreshToken);
        if (!payload) throw new BadRequestError("Invalid refresh token")

        const user = await this.userRepository.findById(payload.id);
        if(!user) throw new NotFoundError("User not found")

        const normalizedUser = user.toObjectSimple();
        const newAccessToken = this.tokenService.generateAccessTokens(normalizedUser);
        const newRefreshToken = this.tokenService.generateRefreshTokens(normalizedUser);


        return {
            refresh_token: newRefreshToken,
            access_token: newAccessToken,
            user: normalizedUser,
        }
    }

    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    private async isCorrectPassword(hashedPassword: string, currentPassword: string): Promise<boolean> {
        return await bcrypt.compare(hashedPassword, currentPassword);
    }
}