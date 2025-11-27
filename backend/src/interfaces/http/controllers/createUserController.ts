import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Role } from "../../../domain/User";
import { UserModel } from "../../../infrastructure/database/UserModel";

export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new UserModel({
    email,
    password: hashedPassword,
    role: Role.Student,
    active: true,
  });
  await user.save();
  return res.status(201).json({ user: { email, role: Role.Student } });
};
