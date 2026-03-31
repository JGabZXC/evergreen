import {ITokenService} from "../../domain/interfaces/ITokenService";
import {AuthPayload} from "../../domain/types/AuthPayload";
import {User} from "../../domain/entities/User";
import jwt from "jsonwebtoken";
import {BadRequestError} from "../../interfaces/http/middleware/HttpErrors";

export class TokenService implements ITokenService {
    constructor(private readonly JWT_SECRET: string, private readonly ACCESS_TOKEN_EXPIRATION: number, private readonly REFRESH_TOKEN_EXPIRATION: number){}

    public generateAccessTokens(user: User): string {
        return jwt.sign(user, this.JWT_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRATION / 1000,
        })
    }

    public generateRefreshTokens(user: User): string {
        return jwt.sign(user, this.JWT_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRATION / 1000,
        })
    }

    public verifyAccessToken(accessToken: string): AuthPayload | null {
        return jwt.verify(accessToken, this.JWT_SECRET) as AuthPayload;
    }

    public verifyRefreshToken(refreshToken: string): AuthPayload | null {
        return jwt.verify(refreshToken, this.JWT_SECRET) as AuthPayload;
    }
}