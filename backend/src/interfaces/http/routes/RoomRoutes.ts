import {Router} from 'express';
import {AuthGuard} from "../middleware/authGuard";
import {TokenService} from "../../../application/services/TokenService";
import {PrismaUserRepository} from "../../../infrastructure/repositories/PrismaUserRepository";
import {Permissions} from "../middleware/Permissions";
import {Role} from "../../../generated/prisma/enums";
import {CreateRoomUseCase} from "../../../application/use-cases/room/CreateRoomUseCase";
import {PrismaRoomRepository} from "../../../infrastructure/repositories/PrismaRoomRepository";
import {RoomController} from "../controllers/RoomController";
import {validateBody} from "../middleware/validateRequest";
import {roomCreateSchema, roomUpdateParamsSchema} from "../../../application/schemas/roomSchemas";
import {GetAllRoomUseCase} from "../../../application/use-cases/room/GetAllRoomUseCase";
import {GetRoomByIdUseCase} from "../../../application/use-cases/room/GetRoomByIdUseCase";
import {validateParams} from "../middleware/validateParams";

const router = Router();

const tokenService = new TokenService(
    process.env.JWT_SECRET as string,
    1000 * 60 * 10, // 10 Minutes
    1000 * 60 * 60, // 1 Hour
);

const userRepository = new PrismaUserRepository();
const roomRepository = new PrismaRoomRepository();
const authGuard = new AuthGuard(tokenService, userRepository);


// USE CASE
const getAllRoomUseCase = new GetAllRoomUseCase(roomRepository);
const getRoomByIdUseeCase = new GetRoomByIdUseCase(roomRepository);
const createRoomUseCase = new CreateRoomUseCase(roomRepository);

// CONTROLLER
const roomController = new RoomController(getAllRoomUseCase, getRoomByIdUseeCase, createRoomUseCase);

router.route("/")
    .get(authGuard.middleware, Permissions.requireRole(Role.ADMIN, Role.REGISTRAR), roomController.getAllRooms)
    .post(authGuard.middleware, validateBody(roomCreateSchema),Permissions.requireRole(Role.ADMIN, Role.REGISTRAR), roomController.createRoom)

router.route("/:roomId")
    .get(authGuard.middleware, validateParams(roomUpdateParamsSchema), Permissions.requireRole(Role.ADMIN, Role.REGISTRAR), roomController.getRoomById)


export default router;