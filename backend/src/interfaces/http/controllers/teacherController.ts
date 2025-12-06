import { Request, Response } from "express";
import { GetTeacherUseCase } from "../../../application/use-cases/teacher/GetTeacherUseCase";
import { GetAllTeacherUseCase } from "../../../application/use-cases/teacher/GetAllTeacherUseCase";
import { BadRequestError } from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/HttpStatus";

const getTeacherUseCase = new GetTeacherUseCase();
const getAllTeacherUseCase = new GetAllTeacherUseCase();

export const getTeacher = async (req: Request, res: Response) => {
  let { page = 1, limit = 10, isActive } = req.query;
  const { teacherId } = req.params;
  const queryFilter: Record<string, boolean> = {};

  if (isActive) {
    queryFilter.isActive = isActive === "true";
  }

  if (teacherId && typeof teacherId !== "string") {
    throw new BadRequestError("Teacher ID is required and must be a string");
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
    let teachers;
    if (teacherId) {
      teachers = await getTeacherUseCase.execute(teacherId as string);
    } else {
      teachers = await getAllTeacherUseCase.execute(
        queryFilter,
        skip,
        Number(limit)
      );

      if (Number(page) > teachers.totalPages) {
        throw new BadRequestError("Page number exceeds total pages");
      }

      return res.status(HttpStatus.OK).json({ ...teachers });
    }

    return res.status(HttpStatus.OK).json(teachers);
  } catch (err) {
    throw err;
  }
};
