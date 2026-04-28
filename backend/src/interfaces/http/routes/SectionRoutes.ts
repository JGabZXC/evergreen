import { Router } from "express";
import { AuthGuard } from "../middleware/authGuard";
import { TokenService } from "../../../application/services/TokenService";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository";
import { Permissions } from "../middleware/Permissions";
import { Role } from "../../../generated/prisma/enums";
import { validateBody } from "../middleware/validateRequest";
import { validateParams } from "../middleware/validateParams";
import {
  sectionCreateSchema,
  sectionParamsSchema,
  sectionUpdateSchema,
} from "../../../application/schemas/sectionSchemas";
import { PrismaSectionRepository } from "../../../infrastructure/repositories/PrismaSectionRepository";
import {
  CreateSectionUseCase,
  DeleteSectionUseCase,
  GetAllSectionUseCase,
  GetSectionByIdUseCase,
  UpdateSectionUseCase,
} from "../../../application/use-cases/section";
import { SectionController } from "../controllers/SectionController";

const router = Router();

const tokenService = new TokenService(
  process.env.JWT_SECRET as string,
  1000 * 60 * 10, // 10 Minutes
  1000 * 60 * 60, // 1 Hour
);

const userRepository = new PrismaUserRepository();
const sectionRepository = new PrismaSectionRepository();
const authGuard = new AuthGuard(tokenService, userRepository);

const getAllSectionUseCase = new GetAllSectionUseCase(sectionRepository);
const getSectionByIdUseCase = new GetSectionByIdUseCase(sectionRepository);
const createSectionUseCase = new CreateSectionUseCase(sectionRepository);
const updateSectionUseCase = new UpdateSectionUseCase(sectionRepository);
const deleteSectionUseCase = new DeleteSectionUseCase(sectionRepository);

const sectionController = new SectionController(
  getAllSectionUseCase,
  getSectionByIdUseCase,
  createSectionUseCase,
  updateSectionUseCase,
  deleteSectionUseCase,
);

router
  .route("/")
  .get(
    authGuard.middleware,
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    sectionController.getAllSections,
  )
  .post(
    authGuard.middleware,
    validateBody(sectionCreateSchema),
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    sectionController.createSection,
  );

router
  .route("/:sectionId")
  .get(
    authGuard.middleware,
    validateParams(sectionParamsSchema),
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    sectionController.getSectionById,
  )
  .patch(
    authGuard.middleware,
    validateParams(sectionParamsSchema),
    validateBody(sectionUpdateSchema),
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    sectionController.updateSection,
  )
  .delete(
    authGuard.middleware,
    validateParams(sectionParamsSchema),
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    sectionController.deleteSection,
  );

export default router;

