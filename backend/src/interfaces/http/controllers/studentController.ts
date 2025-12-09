// backend/src/interfaces/http/controllers/studentController.ts
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { GetStudentGradesUseCase } from "../../../application/use-cases/student/GetStudentGradesUseCase";
import {
  GetAllStudentUseCase,
  GetStudentUseCase,
} from "../../../application/use-cases/student";
import { BadRequestError } from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/HttpStatus";

const getGrades = new GetStudentGradesUseCase();

const getAllStudentUseCase = new GetAllStudentUseCase();
const getStudentUseCase = new GetStudentUseCase();

export const getStudents = async (req: Request, res: Response) => {
  let {
    page = 1,
    limit = 10,
    course,
    studentId,
    view = "enrolled",
  } = req.query;
  let { id } = req.params;

  if (id && typeof id !== "string") {
    throw new BadRequestError("Student ID is required and must be a string");
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
  if (course) filter.course = course as string;
  if (studentId) filter.studentId = studentId as string;

  if (view === "enrolled") {
    filter.isActive = true;
  }

  try {
    let result;
    if (id) {
      result = await getStudentUseCase.execute(id as string);
      return res.status(HttpStatus.OK).json(result);
    } else {
      result = await getAllStudentUseCase.execute(
        filter,
        skip,
        Number(limit),
        view as "enrolled" | "all"
      );

      return res.status(HttpStatus.OK).json({
        ...result,
      });
    }
  } catch (err) {
    throw err;
  }
};

export const getMyGrades = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId } = req.user!; // Get logged-in student's ID

    const grades = await getGrades.execute(studentId!);

    res.status(200).json(grades);
  } catch (error) {
    throw error;
  }
};
