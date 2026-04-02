import { ITokenService } from "../../domain/interfaces/ITokenService";
import { AuthPayload } from "../dto/AuthPayload";
import { UserTokenPayload } from "../dto/UserTokenPayload";
import jwt from "jsonwebtoken";

export class TokenService implements ITokenService {
  constructor(
    private readonly JWT_SECRET: string,
    private readonly ACCESS_TOKEN_EXPIRATION: number,
    private readonly REFRESH_TOKEN_EXPIRATION: number,
  ) {}

  public generateAccessTokens(user: UserTokenPayload): string {
    const payload = { id: user.id, role: user.role };
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: Math.floor(this.ACCESS_TOKEN_EXPIRATION / 1000),
    });
  }

  public generateRefreshTokens(user: UserTokenPayload): string {
    const payload = { id: user.id, role: user.role };
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: Math.floor(this.REFRESH_TOKEN_EXPIRATION / 1000),
    });
  }

  public verifyAccessToken(accessToken: string): AuthPayload | null {
    try {
      return jwt.verify(accessToken, this.JWT_SECRET) as AuthPayload;
    } catch {
      return null;
    }
  }

  public verifyRefreshToken(refreshToken: string): AuthPayload | null {
    try {
      return jwt.verify(refreshToken, this.JWT_SECRET) as AuthPayload;
    } catch {
      return null;
    }
  }
}
