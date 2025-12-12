import { Request, Response } from "express";
import { BadRequestError } from "../middleware/HttpErrors";
import {
  CreateRoomUseCase,
  GetAllRoomUseCase,
  GetRoomUsecase,
  UpdateRoomUseCase,
} from "../../../application/use-cases/room/index";
import { HttpStatus } from "../../../domain/HttpStatus";

const getAllRoomUseCase = new GetAllRoomUseCase();
const getRoomUseCase = new GetRoomUsecase();
const updateRoomUseCase = new UpdateRoomUseCase();
const createRoomUseCase = new CreateRoomUseCase();

export const getRoom = async (req: Request, res: Response) => {
  let {
    page = 1,
    limit = 10,
    search,
    type,
    capacity,
    status,
    isActive,
  } = req.query;
  let { roomId } = req.params;

  if (roomId && typeof roomId !== "string") {
    throw new BadRequestError("Room ID is required and must be a string");
  }

  if ((page && isNaN(Number(page))) || (page && Number(page) < 1)) {
    throw new BadRequestError("Page must be a positive number");
  }

  if ((limit && isNaN(Number(limit))) || (limit && Number(limit) < 1)) {
    throw new BadRequestError("Limit must be a positive number");
  }

  if (limit && Number(limit) > 100) {
    limit = 100;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const filter: Record<string, string | number | boolean> = {};
  if (search) filter.name = search as string;
  if (type) filter.type = type as string;
  if (capacity) filter.capacity = Number(capacity);
  if (status) filter.status = status as string;

  try {
    let rooms;
    if (roomId) {
      rooms = await getRoomUseCase.execute(roomId as string);
    } else {
      rooms = await getAllRoomUseCase.execute(filter, skip, Number(limit));

      if (rooms.totalPages > Number(page) && rooms.rooms.length === 0) {
        throw new BadRequestError("Page number exceeds total pages available");
      }

      return res.status(HttpStatus.OK).json({ ...rooms });
    }

    return res.status(HttpStatus.OK).json({ ...rooms });
  } catch (error) {
    throw error;
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { name, type, capacity, status, isActive } = req.body;
  if (!roomId || typeof roomId !== "string") {
    throw new BadRequestError("Room ID is required and must be a string");
  }
  try {
    const updatedRoom = await updateRoomUseCase.execute(roomId, {
      name,
      type,
      capacity,
      status,
      isActive,
    });

    return res.status(HttpStatus.OK).json(updatedRoom);
  } catch (error) {
    throw error;
  }
};

export const createRoom = async (req: Request, res: Response) => {
  const { name, type, capacity, status, isActive } = req.body;
  try {
    const newRoom = await createRoomUseCase.execute({
      name,
      type,
      capacity,
      status,
      isActive,
    });
    return res.status(HttpStatus.CREATED).json(newRoom);
  } catch (error) {
    throw error;
  }
};
