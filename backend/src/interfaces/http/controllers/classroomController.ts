import { Request, Response } from "express";
import {
  CreateClassroomUseCase,
  GetAllClassroomUseCase,
  GetClassroomUseCase,
  UpdateClassroomUseCase,
} from "../../../application/use-cases/classroom";
import { HttpStatus } from "../../../domain/HttpStatus";
import { BadRequestError } from "../middleware/HttpErrors";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { StaffModel } from "../../../infrastructure/database/StaffModel";

const createClassroomUseCase = new CreateClassroomUseCase();
const getAllClassroomUseCase = new GetAllClassroomUseCase();
const getClassroomUseCase = new GetClassroomUseCase();
const updateClassroomUseCase = new UpdateClassroomUseCase();

export const createClassroom = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { adviserId, name, gradeLevel, capacity } = req.body;
    let errors: { [key: string]: string } = {};
    if (!adviserId || typeof adviserId !== "string") {
      errors.adviserId = "Adviser ID is required and must be a string";
    } else if ((await StaffModel.findOne({ adviserId })) === null) {
      errors.adviserId = "Adviser ID does not exist";
    }

    if (!name || typeof name !== "string") {
      errors.name = "Classroom name is required and must be a string";
    }

    if (!gradeLevel || typeof gradeLevel !== "string") {
      errors.gradeLevel = "Grade level is required and must be a string";
    }

    if (!capacity || typeof capacity !== "number") {
      errors.capacity = "Capacity is required and must be a number";
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestError("Validation failed", errors);
    }

    const createdClassroom = await createClassroomUseCase.execute(req.body);
    return res.status(HttpStatus.CREATED).json(createdClassroom);
  } catch (err) {
    throw err;
  }
};

export const getClassroom = async (req: Request, res: Response) => {
  let { page = 1, limit = 10 } = req.query;
  let { id } = req.params;

  if (id && typeof id !== "string") {
    throw new BadRequestError("Classroom ID must be a string");
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

  try {
    let classrooms;
    if (id) {
      classrooms = await getClassroomUseCase.execute(id as string);
    } else {
      classrooms = await getAllClassroomUseCase.execute(skip, Number(limit));
      return res.status(HttpStatus.OK).json({ ...classrooms });
    }
    return res.status(HttpStatus.OK).json(classrooms);
  } catch (err) {
    throw err;
  }
};

export const updateClassroom = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new BadRequestError(
        "Classroom ID is required and must be a string"
      );
    }
    const updatedClassroom = await updateClassroomUseCase.execute(id, req.body);
    return res.status(HttpStatus.OK).json(updatedClassroom);
  } catch (err) {
    throw err;
  }
};
