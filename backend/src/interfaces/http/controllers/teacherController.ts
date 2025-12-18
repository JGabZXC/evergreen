import mongoose from "mongoose";
import { Response } from "express";
import { GetTeacherUseCase } from "../../../application/use-cases/teacher/GetTeacherUseCase";
import { GetAllTeacherUseCase } from "../../../application/use-cases/teacher/GetAllTeacherUseCase";
import { UpdateGradeUseCase } from "../../../application/use-cases/teacher/UpdateGradeUseCase";
import { BadRequestError } from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/HttpStatus";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { StaffRole } from "../../../domain/types/Role";

const getTeacherUseCase = new GetTeacherUseCase();
const getAllTeacherUseCase = new GetAllTeacherUseCase();
const updateGradeUseCase = new UpdateGradeUseCase();

export const updateGrade = async (req: AuthenticatedRequest, res: Response) => {
  const { subjectTakenId, term, grade, remarks } = req.body;
  const teacherId = req.user!.employeeId!;

  if (!subjectTakenId || !term || grade === undefined) {
    throw new BadRequestError("Missing required fields");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedRecord = await updateGradeUseCase.execute(
      teacherId,
      { subjectTakenId, term, grade, remarks },
      session
    );

    await session.commitTransaction();
    return res.status(HttpStatus.OK).json(updatedRecord);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getTeacher = async (req: AuthenticatedRequest, res: Response) => {
  let { page = 1, limit = 10, isActive } = req.query;
  let { teacherId } = req.params;
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

  if (req.path.includes("/me") || !teacherId) {
    if (req.user!.role === StaffRole.Teacher) {
      teacherId = req.user?.employeeId;
    }
  }

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

      return res.status(HttpStatus.OK).json({ ...teachers });
    }

    return res.status(HttpStatus.OK).json(teachers);
  } catch (err) {
    throw err;
  }
};
