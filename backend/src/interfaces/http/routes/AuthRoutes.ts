import { Router } from "express";
import {AuthController} from "../controllers/AuthController";
import {AuthService} from "../../../application/services/AuthService";
import {TokenService} from "../../../application/services/TokenService";
import {PrismaUserRepository} from "../../../infrastructure/repositories/PrismaUserRepository";
import {AuthGuard} from "../middleware/authGuard";

const router = Router();

const tokenService = new TokenService(
    process.env.JWT_SECRET as string,
    1000 * 60 * 10, // 10 Minutes
    1000 * 60 * 60, // 1 Hour
);
const userRepository = new PrismaUserRepository();

const authService = new AuthService(tokenService, userRepository);
const authController = new AuthController(authService);
const authGuard = new AuthGuard(tokenService, userRepository)

router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);
router.route("/create").post(authGuard.middleware, authController.create);
router.route("/refresh-token").post(authController.refreshToken);


export default router;
