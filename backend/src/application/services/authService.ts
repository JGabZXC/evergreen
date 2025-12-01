import jwt from "jsonwebtoken";
import { RefreshTokenModel } from "../../infrastructure/database/RefreshTokenModel";
import { User } from "../../domain/User";
import { AuthPayload } from "../../domain/types/AuthPayload";
import { Response } from "express";

export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || "changeme";
  private ACCESS_TOKEN_EXPIRES_IN = 1000 * 60 * 10; // 10 minutes
  private REFRESH_TOKEN_EXPIRES_IN = 1000 * 60 * 30; // 30 minutes
  // private ACCESS_TOKEN_EXPIRES_IN = 1000 * 5; // 5 seconds
  // private REFRESH_TOKEN_EXPIRES_IN = 1000 * 60 * 30; // 30 minutes

  private generateAccessToken(payload: AuthPayload) {
    const { exp, iat, ...cleanPayload } = payload;
    return jwt.sign(cleanPayload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN / 1000,
    });
  }

  private generateRefreshToken(payload: AuthPayload) {
    const { exp, iat, ...cleanPayload } = payload;
    return jwt.sign(cleanPayload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN / 1000,
    });
  }

  async generateTokens(
    user: User,
    roleId?: { studentId?: string; employeeId?: string }
  ) {
    const payload: AuthPayload = {
      _id: String(user._id!),
      email: user.email,
      role: user.role,
      ...roleId,
    };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    await RefreshTokenModel.findOneAndUpdate(
      { userEmail: user.email },
      { token: refreshToken, createdAt: new Date() },
      { upsert: true, new: true }
    );
    return { accessToken, refreshToken };
  }

  async validateAndRotateRefreshToken(oldRefreshToken: string) {
    let payload: AuthPayload;
    try {
      payload = jwt.verify(oldRefreshToken, this.JWT_SECRET) as AuthPayload;
    } catch {
      return null;
    }
    const stored = await RefreshTokenModel.findOne({
      userEmail: payload.email,
    });
    if (!stored || stored.token !== oldRefreshToken) {
      return null;
    }
    const newAccessToken = this.generateAccessToken(payload);
    const newRefreshToken = this.generateRefreshToken(payload);
    stored.token = newRefreshToken;
    stored.createdAt = new Date();
    await stored.save();
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      email: payload.email,
    };
  }

  async invalidateRefreshToken(token: string) {
    // Find the refresh token and its user
    const stored = await RefreshTokenModel.findOne({ token });
    if (!stored) {
      return;
    }
    // Since only one device/session per user, delete just this token
    await RefreshTokenModel.deleteOne({ token });
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    const bcrypt = await import("bcrypt");
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(plainPassword: string): Promise<string> {
    const bcrypt = await import("bcrypt");
    return bcrypt.hash(plainPassword, 10);
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: this.ACCESS_TOKEN_EXPIRES_IN,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: this.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  verifyAccessToken(token: string): AuthPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as AuthPayload;
    } catch {
      return null;
    }
  }
}
