import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository";
import { GetAllUserUseCase } from "../../../application/use-cases/user/GetAllUserUseCase";
import { UpdateUserPasswordUseCase } from "../../../application/use-cases/user/UpdateUserPasswordUseCase";
import { PasswordService } from "../../../application/services/PasswordService";
import { AuthGuard } from "../middleware/authGuard";
import { TokenService } from "../../../application/services/TokenService";
import { Permissions } from "../middleware/Permissions";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

const userRepository = new PrismaUserRepository();
const passwordService = new PasswordService(Number(process.env.PASSWORD_SALT_ROUNDS) || 12);
const getAllUserUseCase = new GetAllUserUseCase(userRepository);
const updateUserPasswordUseCase = new UpdateUserPasswordUseCase(userRepository, passwordService);

const tokenService = new TokenService(process.env.JWT_SECRET as string, 1000 * 60 * 10, 1000 * 60 * 60);
const authGuard = new AuthGuard(tokenService, userRepository);

const userController = new UserController(updateUserPasswordUseCase, getAllUserUseCase);

// GET /api/users/ - admin only
router.route("/").get(authGuard.middleware, Permissions.requireRole(Role.ADMIN, Role.REGISTRAR), userController.getAllUsers);

export default router;

