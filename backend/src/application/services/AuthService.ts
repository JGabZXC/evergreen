import {Response} from "express";
import {IAuthService} from "../../domain/interfaces/IAuthService";
import {IUserRepository} from "../../domain/interfaces/IUserRepository";
import {ITokenService} from "../../domain/interfaces/ITokenService";
import {IPasswordService} from "../../domain/interfaces/IPasswordService";
import {BadRequestError, NotFoundError} from "../../interfaces/http/middleware/HttpErrors";
import {UserMapper} from "../../infrastructure/mapper/UserMapper";
import {AuthResponse} from "../dto/AuthResponse";
import {UserCreateRequest} from "../dto/UserCreateRequest";
import {User} from "../../domain/entities/User";
import {Prisma, Role} from "../../generated/prisma/client";

export class AuthService implements IAuthService {
    constructor(
        private readonly tokenService: ITokenService,
        private readonly passwordService: IPasswordService,
        private readonly userRepository: IUserRepository,
    ) {}

    public async login(identifier: string, password: string): Promise<AuthResponse> {
        const rawUser = await this.userRepository.findRawByAccountNumberOrEmail(identifier)
        if (!rawUser) throw new NotFoundError("User not found");

        if(!(await this.passwordService.compare(password, rawUser.password))) throw new BadRequestError("Invalid credentials")

        const domainUser = UserMapper.toDomain(rawUser);
        const userResponse = UserMapper.toResponseShallow(domainUser)
        const userTokenPayload = UserMapper.toTokenPayload(domainUser)
        const access_token = this.tokenService.generateAccessTokens(userTokenPayload)
        const refresh_token = this.tokenService.generateRefreshTokens(userTokenPayload)

        return {
            access_token,
            refresh_token,
            user: userResponse,
        };
    }

    public async logout(res: Response): Promise<void> {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
    }

    public async create(data: UserCreateRequest, creatorId: string): Promise<User | undefined> {
        try {
            const dataWitHashedPassword = {
                ...data,
                user: {
                    ...data.user,
                    password: await this.passwordService.hash(data.user.password),
                },
            }
            return await this.userRepository.create(dataWitHashedPassword, creatorId);
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

        const responseUser = UserMapper.toResponseShallow(user)
        const newAccessToken = this.tokenService.generateAccessTokens({id: responseUser.id, role: responseUser.role as Role});
        const newRefreshToken = this.tokenService.generateRefreshTokens({id: responseUser.id, role: responseUser.role as Role});


        return {
            refresh_token: newRefreshToken,
            access_token: newAccessToken,
            user: responseUser,
        }
    }

}