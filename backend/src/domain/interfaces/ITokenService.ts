import {AuthPayload} from "../../application/dto/AuthPayload";
import {UserTokenPayload} from "../../application/dto/UserTokenPayload";

export interface ITokenService {
    generateAccessTokens(user: UserTokenPayload): string
    generateRefreshTokens(user: UserTokenPayload): string
    verifyAccessToken(accessToken: string):AuthPayload | null;
    verifyRefreshToken(refreshToken: string): AuthPayload | null;
}