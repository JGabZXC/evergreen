import { Request, Response, NextFunction } from "express";
import { CreateSchoolYearUseCase } from "../../../application/use-cases/school-year/CreateSchoolYearUseCase";
import { GetSchoolYearsUseCase } from "../../../application/use-cases/school-year/GetSchoolYearsUseCase";
import { UpdateSchoolYearUseCase } from "../../../application/use-cases/school-year/UpdateSchoolYearUseCase";
import { HttpStatus } from "../../../domain/HttpStatus";
import { BadRequestError } from "../middleware/HttpErrors";

const createSchoolYearUseCase = new CreateSchoolYearUseCase();
const getSchoolYearUseCase = new GetSchoolYearsUseCase();
const updateSchoolYearUseCase = new UpdateSchoolYearUseCase();

export const createSchoolYear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createSchoolYearUseCase.execute(req.body);
    res.status(HttpStatus.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSchoolYears = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getSchoolYearUseCase.execute();
    res.status(HttpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSchoolYear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!id) throw new BadRequestError("School Year ID is required");

  try {
    const result = await updateSchoolYearUseCase.execute(id, req.body);
    res.status(HttpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};
