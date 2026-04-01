import { Router } from "express";
import { TeacherAcademicBackgroundController } from "../controllers/TeacherAcademicBackgroundController";
import { PrismaTeacherAcademicBackgroundRepository } from "../../../infrastructure/repositories/PrismaTeacherAcademicBackgroundRepository";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository";
import {
    CreateTeacherAcademicBackgroundUseCase,
    GetAllTeacherAcademicBackgroundUseCase
} from "../../../application/use-cases/teacher_academic_background";
import { TokenService } from "../../../application/services/TokenService";
import { AuthGuard } from "../middleware/authGuard";
import {Permissions} from "../middleware/Permissions";

const router = Router();

const tokenService = new TokenService(
  process.env.JWT_SECRET as string,
  1000 * 60 * 10, // 10 Minutes
  1000 * 60 * 60, // 1 Hour
);

const userRepository = new PrismaUserRepository();
const teacherRepo = new PrismaTeacherAcademicBackgroundRepository();

const getAllUseCase = new GetAllTeacherAcademicBackgroundUseCase(teacherRepo);
const createUseCase = new CreateTeacherAcademicBackgroundUseCase(teacherRepo);
const controller = new TeacherAcademicBackgroundController(userRepository, getAllUseCase, createUseCase);
const authGuard = new AuthGuard(tokenService, userRepository);

// Public: list all teacher academic backgrounds (requires auth)
router.route("/")
    .get(authGuard.middleware, controller.getAllTeacherAcademicBackground)
    .post(authGuard.middleware, Permissions.isTeacher, controller.createTeacherAcademicBackground);

// List backgrounds for a specific user
router.get("/users/:userId", authGuard.middleware, controller.getAllTeacherAcademicBackground);

export default router;


