import { Request, Response } from "express";
import { Role, BaseUser } from "../../../domain/User";
import { HttpStatus } from "../../../domain/HttpStatus";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { AuthService } from "../../../application/services/authService";
import { BadRequestError } from "../middleware/HttpErrors";
import { AuthenticatedRequest } from "../middleware/authGuard";

const authService = new AuthService();

export const register = async (
  req: Request & AuthenticatedRequest,
  res: Response
) => {
  const { email, password, role } = req.body;
  const errors: { [key: string]: string } = {};

  if (!email) {
    errors["email"] = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors["email"] = "Email format is invalid";
  }
  if (!password) {
    errors["password"] = "Password is required";
  }
  if (!role || !Object.values(Role).includes(role)) {
    errors["role"] = "Invalid role specified";
  }

  if (role === "admin" && req.user && req.user.role !== Role.Admin) {
    errors["role"] = "Only admins can create admin users";
  }

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError("Validation errors", errors);
  }

  const newUser: BaseUser = {
    email,
    password: await authService.hashPassword(password),
    role: role as Role,
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
  const errors: { [key: string]: string } = {};

  if (!email) {
    errors["email"] = "Email is required";
  }

  if (!password) {
    errors["password"] = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError("Validation errors", errors);
  }

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) {
    throw new BadRequestError("User not found", { email });
  }

  if (!(await authService.comparePasswords(password, user.password))) {
    throw new BadRequestError("Invalid email or password");
  }

  const { accessToken, refreshToken } = await authService.generateTokens(user);
  authService.setAuthCookies(res, accessToken, refreshToken);

  return res.status(HttpStatus.OK).json({ user });
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

export const testProtected = async (
  req: Request & AuthenticatedRequest,
  res: Response
) => {
  return res.status(HttpStatus.OK).json({
    message: "You have accessed a protected route",
    user: req.user,
  });
};
