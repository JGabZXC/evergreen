import { Router } from "express";
import { TeacherAcademicBackgroundController } from "../controllers/TeacherAcademicBackgroundController";
import { PrismaTeacherAcademicBackgroundRepository } from "../../../infrastructure/repositories/PrismaTeacherAcademicBackgroundRepository";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository";
import {
    CreateTeacherAcademicBackgroundUseCase,
    GetAllTeacherAcademicBackgroundUseCase
} from "../../../application/use-cases/teacher_academic_background";
import { UpdateTeacherAcademicBackgroundUseCase } from "../../../application/use-cases/teacher_academic_background";
import { TokenService } from "../../../application/services/TokenService";
import { AuthGuard } from "../middleware/authGuard";
import {Permissions} from "../middleware/Permissions";
import {validateBody} from "../middleware/validateRequest";
import {teacherAcademicBackgroundCreateSchema, teacherAcademicBackgroundUpdateSchema} from "../../../application/schemas/teacherAcademicBackgroundSchemas";

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
const updateUseCase = new UpdateTeacherAcademicBackgroundUseCase(teacherRepo);
const controller = new TeacherAcademicBackgroundController(userRepository, getAllUseCase, createUseCase, updateUseCase, teacherRepo);
const authGuard = new AuthGuard(tokenService, userRepository);

// Public: list all teacher academic backgrounds (requires auth)
router.route("/")
    .get(authGuard.middleware, controller.getAllTeacherAcademicBackground)
    .post(authGuard.middleware, validateBody(teacherAcademicBackgroundCreateSchema), Permissions.isTeacher, controller.createTeacherAcademicBackground);

// Update a teacher academic background (PATCH)
router.patch('/:id', authGuard.middleware, validateBody(teacherAcademicBackgroundUpdateSchema), Permissions.isTeacher, controller.updateTeacherAcademicBackground);

// List backgrounds for a specific user
router.get("/users/:userId", authGuard.middleware, controller.getAllTeacherAcademicBackground);

export default router;


