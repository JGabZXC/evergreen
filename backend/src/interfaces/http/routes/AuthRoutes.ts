import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { AuthService } from "../../../application/services/AuthService";
import { TokenService } from "../../../application/services/TokenService";
import { PasswordService } from "../../../application/services/PasswordService";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository";
import { CreateUserUseCase } from "../../../application/use-cases/user";
import { UpdateUserPasswordUseCase } from "../../../application/use-cases/user/UpdateUserPasswordUseCase";
import { AuthGuard } from "../middleware/authGuard";
import { Permissions } from "../middleware/Permissions";
import { Role } from "../../../generated/prisma/enums";
import { validateBody } from "../middleware/validateRequest";
import {
  loginSchema,
  updatePasswordAdminSchema,
  updatePasswordSchema,
  userCreateSchema
} from "../../../application/schemas/authSchemas";

const router = Router();

const tokenService = new TokenService(
  process.env.JWT_SECRET as string,
  1000 * 60 * 10, // 10 Minutes
  1000 * 60 * 60, // 1 Hour
);
const userRepository = new PrismaUserRepository();
const passwordService = new PasswordService(
  Number(process.env.PASSWORD_SALT_ROUNDS) || 12,
);
const authService = new AuthService(
  tokenService,
  passwordService,
  userRepository,
);
const createUserUseCase = new CreateUserUseCase(userRepository);
const updateUserPasswordUseCase = new UpdateUserPasswordUseCase(
  userRepository,
  passwordService,
);
const userController = new UserController(
  updateUserPasswordUseCase,
);
const authController = new AuthController(authService, createUserUseCase);
const authGuard = new AuthGuard(tokenService, userRepository);

router.route("/login").post(validateBody(loginSchema), authController.login);
router.route("/logout").post(authController.logout);
router
  .route("/create")
  .post(
    authGuard.middleware,
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    validateBody(userCreateSchema),
    authController.create,
  );
router
  .route("/change-password")
  .post(validateBody(updatePasswordSchema), authGuard.middleware, userController.changePassword);
router
  .route("/set-password")
  .post(validateBody(updatePasswordAdminSchema), authGuard.middleware, Permissions.isAdmin, userController.setPassword);
router.route("/refresh-token").post(authController.refreshToken);

export default router;
