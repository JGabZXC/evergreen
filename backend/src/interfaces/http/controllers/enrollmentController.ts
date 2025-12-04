import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import {
  EnrollStudentUseCase,
  TransferStudentSectionUseCase,
} from "../../../application/use-cases/enrollment/index";
import { ErollmentRecordDTO, TransferSectionDTO } from "../types/EnrollmentDTO";
import { BadRequestError } from "../middleware/HttpErrors";

const enrollUseCase = new EnrollStudentUseCase();
const transferUseCase = new TransferStudentSectionUseCase();

export const enrollStudent = async (req: Request, res: Response) => {
  const body = req.body as ErollmentRecordDTO;

  // Basic validation
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Request body is required");
  }

  const { studentId, gradeLevel, semester } = body;
  if (!studentId || !gradeLevel || semester === undefined) {
    throw new BadRequestError(
      "studentId, gradeLevel and semester are required"
    );
  }

  try {
    const enrollment = await enrollUseCase.execute(body as any);
    return res.status(HttpStatus.CREATED).json(enrollment);
  } catch (err) {
    throw err;
  }
};

export const transferStudentSection = async (req: Request, res: Response) => {
  const body = req.body as TransferSectionDTO;
  if (!body || typeof body !== "object") {
    throw new BadRequestError("Request body is required");
  }

  const { studentId, newClassroomId } = body;
  if (!studentId || !newClassroomId) {
    throw new BadRequestError("studentId and newClassroomId are required");
  }

  try {
    await transferUseCase.execute(body as any);
    return res
      .status(HttpStatus.NO_CONTENT)
      .json({ message: "Student transferred successfully" });
  } catch (err) {
    throw err;
  }
};
