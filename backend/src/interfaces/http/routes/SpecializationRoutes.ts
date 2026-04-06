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
import {
  specializationCreateSchema,
  specializationUpdateParamsSchema,
  specializationUpdateSchema
} from "../../../application/schemas/specializationSchemas";
import {validateParams} from "../middleware/validateParams";
import {ApproveSpecializationUseCase} from "../../../application/use-cases/specialization/ApproveSpecializationUseCase";

const router = Router();

const tokenService = new TokenService(
  process.env.JWT_SECRET as string,
  1000 * 60 * 10, // 10 Minutes
  1000 * 60 * 60, // 1 Hour
);

const userRepository = new PrismaUserRepository();
const specializationRepo = new PrismaSpecializationRepository();

const getAllUseCase = new GetAllSpecializationUseCase(specializationRepo);
const createUseCase = new CreateSpecializationUseCase(specializationRepo, userRepository);
const updateUseCase = new UpdateSpecializationUseCase(specializationRepo);
const approveUseCase = new ApproveSpecializationUseCase(specializationRepo);

const controller = new SpecializationController(userRepository, specializationRepo, getAllUseCase, createUseCase, updateUseCase, approveUseCase);
const authGuard = new AuthGuard(tokenService, userRepository);

router
  .route("/")
  .get(authGuard.middleware, controller.getAllSpecializations)
  .post(authGuard.middleware, validateBody(specializationCreateSchema), Permissions.isTeacher, controller.createSpecialization);

router.patch("/:id", authGuard.middleware, validateParams(specializationUpdateParamsSchema),validateBody(specializationUpdateSchema), controller.updateSpecialization);
router.patch("/:id/approval", validateParams(specializationUpdateParamsSchema), authGuard.middleware, controller.approveSpecialization);

router.get("/users/:userId", authGuard.middleware, controller.getAllSpecializations);

export default router;



