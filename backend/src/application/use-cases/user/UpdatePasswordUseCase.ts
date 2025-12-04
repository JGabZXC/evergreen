import mongoose from "mongoose";
import { AuthService } from "../../services/authService";
import { UserModel } from "../../../infrastructure/database/UserModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";

export class UpdatePasswordUseCase {
  private authService = new AuthService();
  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string,
    session?: mongoose.ClientSession
  ) {
    try {
      const user = await UserModel.findById(userId)
        .select("+password")
        .session(session ?? null);
      if (!user) throw new NotFoundError("User not found");

      const isPasswordValid = await this.authService.comparePasswords(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        throw new BadRequestError("Current password is incorrect");
      }

      const hashedPassword = await this.authService.hashPassword(newPassword);

      const result = await UserModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true, session: session ?? null }
      );

      // Generate new tokens to keep user logged in
      const tokens = await this.authService.generateTokens(result!);

      return { user: result, tokens };
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error("Failed to update password");
    }
  }
}
