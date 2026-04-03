import { Router } from "express";
import { SpecializationController } from "../controllers/SpecializationController";
import { PrismaSpecializationRepository } from "../../../infrastructure/repositories/PrismaSpecializationRepository";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository";
import {
  CreateSpecializationUseCase,
  GetAllSpecializationUseCase,
  UpdateSpecializationUseCase,
} from "../../../application/use-cases/specialization";
import { TokenService } from "../../../application/services/TokenService";
import { AuthGuard } from "../middleware/authGuard";
import { Permissions } from "../middleware/Permissions";
import { validateBody } from "../middleware/validateRequest";
import { specializationCreateSchema, specializationUpdateSchema } from "../../../application/schemas/specializationSchemas";

const router = Router();

const tokenService = new TokenService(
  process.env.JWT_SECRET as string,
  1000 * 60 * 10, // 10 Minutes
  1000 * 60 * 60, // 1 Hour
);

const userRepository = new PrismaUserRepository();
const specializationRepo = new PrismaSpecializationRepository();

const getAllUseCase = new GetAllSpecializationUseCase(specializationRepo);
const createUseCase = new CreateSpecializationUseCase(specializationRepo);
const updateUseCase = new UpdateSpecializationUseCase(specializationRepo);

const controller = new SpecializationController(userRepository, getAllUseCase, createUseCase, updateUseCase);
const authGuard = new AuthGuard(tokenService, userRepository);

router
  .route("/")
  .get(authGuard.middleware, controller.getAllSpecializations)
  .post(authGuard.middleware, validateBody(specializationCreateSchema), Permissions.isTeacher, controller.createSpecialization);

router.patch("/:id", authGuard.middleware, validateBody(specializationUpdateSchema), controller.updateSpecialization);

router.get("/users/:userId", authGuard.middleware, controller.getAllSpecializations);

export default router;



