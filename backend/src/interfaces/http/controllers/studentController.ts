// backend/src/interfaces/http/controllers/studentController.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { GetStudentGradesUseCase } from "../../../application/use-cases/student/GetStudentGradesUseCase";

const getGrades = new GetStudentGradesUseCase();

export const getMyGrades = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId } = req.user!; // Get logged-in student's ID

    const grades = await getGrades.execute(studentId!);

    res.status(200).json(grades);
  } catch (error) {
    throw error;
  }
};
