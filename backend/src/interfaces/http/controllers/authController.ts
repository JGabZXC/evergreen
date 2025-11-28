import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, Role } from "../../../domain/User";
import { HttpStatus } from "../../../domain/HttpStatus";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { AuthService } from "../../../application/services/authService";
import { BadRequestError } from "../middleware/HttpErrors";

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  if (!Object.values(Role).includes(role)) {
    return res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid role" });
  }

  const newUser: User = {
    email,
    password: await authService.hashPassword(password),
    role: Role[role as keyof typeof Role],
    createdAt: new Date(),
    active: true,
  };

  let user;

  try {
    user = await UserModel.create(newUser);
  } catch (err: any) {
    if (err.code === 11000) {
      throw new BadRequestError("Email already exists", err.keyValue);
    }

    throw err;
  }

  return res.status(HttpStatus.CREATED).json({ user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: "Missing credentials" });
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Invalid email or password" });
  }

  if (!(await authService.comparePasswords(password, user.password))) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Invalid email or password" });
  }

  const { accessToken, refreshToken } = await authService.generateTokens(user);
  authService.setAuthCookies(res, accessToken, refreshToken);
  return res.status(HttpStatus.OK).json({ message: "Login successful" });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await authService.invalidateRefreshToken(refreshToken);
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.status(HttpStatus.OK).json({ message: "Logged out" });
};

export const refresh = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "No refresh token provided" });
  }
  const tokens =
    await authService.validateAndRotateRefreshToken(oldRefreshToken);
  if (!tokens) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Invalid or expired refresh token" });
  }
  authService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return res.status(HttpStatus.OK).json({ message: "Token refreshed" });
};
