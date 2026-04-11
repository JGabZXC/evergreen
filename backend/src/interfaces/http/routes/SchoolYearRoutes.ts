import { Router } from "express";
import { SchoolYearController } from "../controllers/SchoolYearController";
import { PrismaSchoolYearRepository } from "../../../infrastructure/repositories/PrismaSchoolYearRepository";
import {
  CreateSchoolYearUseCase,
  DeleteSchoolYearUseCase,
  GetAllSchoolYearUseCase,
  GetSchoolYearByIdUseCase,
  UpdateSchoolYearUseCase,
} from "../../../application/use-cases/school_year";
import { TokenService } from "../../../application/services/TokenService";
import { AuthGuard } from "../middleware/authGuard";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository";
import { Permissions } from "../middleware/Permissions";
import { Role } from "../../../generated/prisma/enums";
import { validateBody } from "../middleware/validateRequest";
import { validateParams } from "../middleware/validateParams";
import {
  schoolYearCreateSchema,
  schoolYearParamsSchema,
  schoolYearUpdateSchema,
} from "../../../application/schemas/schoolYearSchemas";

const router = Router();

const tokenService = new TokenService(
  process.env.JWT_SECRET as string,
  1000 * 60 * 10, // 10 Minutes
  1000 * 60 * 60, // 1 Hour
);

const userRepository = new PrismaUserRepository();
const schoolYearRepository = new PrismaSchoolYearRepository();
const getAllSchoolYearUseCase = new GetAllSchoolYearUseCase(
  schoolYearRepository,
);
const createSchoolYearUseCase = new CreateSchoolYearUseCase(
  schoolYearRepository,
);
const getSchoolYearByIdUseCase = new GetSchoolYearByIdUseCase(
  schoolYearRepository,
);
const updateSchoolYearUseCase = new UpdateSchoolYearUseCase(
  schoolYearRepository,
);
const deleteSchoolYearUseCase = new DeleteSchoolYearUseCase(
  schoolYearRepository,
);
const schoolYearController = new SchoolYearController(
  getAllSchoolYearUseCase,
  createSchoolYearUseCase,
  getSchoolYearByIdUseCase,
  updateSchoolYearUseCase,
  deleteSchoolYearUseCase,
);
const authGuard = new AuthGuard(tokenService, userRepository);

router
  .route("/")
  .get(
    authGuard.middleware,
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    schoolYearController.getAllSchoolYears,
  )
  .post(
    authGuard.middleware,
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    validateBody(schoolYearCreateSchema),
    schoolYearController.createSchoolYear,
  );

router
  .route("/:id")
  .get(
    authGuard.middleware,
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    validateParams(schoolYearParamsSchema),
    schoolYearController.getSchoolYearById,
  )
  .patch(
    authGuard.middleware,
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    validateParams(schoolYearParamsSchema),
    validateBody(schoolYearUpdateSchema),
    schoolYearController.updateSchoolYear,
  )
  .delete(
    authGuard.middleware,
    Permissions.requireRole(Role.ADMIN, Role.REGISTRAR),
    validateParams(schoolYearParamsSchema),
    schoolYearController.deleteSchoolYear,
  );

export default router;
