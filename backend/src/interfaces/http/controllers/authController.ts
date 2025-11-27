import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Role } from "../../../domain/User";
import { HttpStatus } from "../../../domain/HttpStatus";

// In-memory user store for demonstration
const users: User[] = [];

// In-memory refresh token store (use DB in production)
const refreshTokens: Record<string, string> = {};

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = "1h";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res
      .status(HttpStatus.CONFLICT)
      .json({ error: "Email already registered" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    email,
    password: hashedPassword,
    role: Role.Student,
    createdAt: new Date(),
    active: true,
  };
  users.push(newUser);
  return res
    .status(HttpStatus.CREATED)
    .json({ user: { email, role: Role.Student } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: "Missing credentials" });
  }
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Invalid email or password" });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Invalid email or password" });
  }
  // Generate tokens
  const accessToken = jwt.sign(
    { email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  // Store refresh token
  refreshTokens[email] = refreshToken;
  // Send tokens as httpOnly cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(HttpStatus.OK).json({ message: "Login successful" });
};

export const logout = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    // Invalidate refresh token
    for (const email in refreshTokens) {
      if (refreshTokens[email] === refreshToken) {
        delete refreshTokens[email];
        break;
      }
    }
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.status(HttpStatus.OK).json({ message: "Logged out" });
};

export const refresh = (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "No refresh token provided" });
  }
  let payload: any;
  try {
    payload = jwt.verify(oldRefreshToken, JWT_SECRET);
  } catch {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Invalid refresh token" });
  }
  const storedToken = refreshTokens[payload.email];
  if (storedToken !== oldRefreshToken) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Refresh token not recognized" });
  }
  // Rotate refresh token
  const newAccessToken = jwt.sign(
    { email: payload.email, role: payload.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
  const newRefreshToken = jwt.sign(
    { email: payload.email, role: payload.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  refreshTokens[payload.email] = newRefreshToken;
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(HttpStatus.OK).json({ message: "Token refreshed" });
};
