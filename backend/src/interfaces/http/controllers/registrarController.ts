import mongoose from "mongoose";
import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { BadRequestError } from "../middleware/HttpErrors";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { EnrollStudentUseCase } from "../../../application/use-cases/enrollment";
import { CreditTransferSubjectsUseCase } from "../../../application/use-cases/registrar/CreditTransferSubjectsUseCase";
// ENROLLMENT & CREDIT
const enrollStudentUseCase = new EnrollStudentUseCase();
const creditTransferSubjectsUseCase = new CreditTransferSubjectsUseCase();
export const enrollStudent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const enrollmentRecord = await enrollStudentUseCase.execute(req.body);
    return res
      .status(HttpStatus.CREATED)
      .json({ message: "Student enrolled successfully", enrollmentRecord });
  } catch (err: any) {
    throw err;
  }
};

export const creditSubject = async (req: Request, res: Response) => {
  const { credits } = req.body;

  if (!Array.isArray(credits) || credits.length === 0) {
    throw new BadRequestError("credits must be a non-empty array");
  }

  try {
    const creditedSubjects =
      await creditTransferSubjectsUseCase.execute(credits);
    return res.status(HttpStatus.CREATED).json({
      message: "Subjects credited successfully",
      creditedSubjects,
    });
  } catch (err: any) {
    throw err;
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  const { userIds } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError("userIds must be a non-empty array");
  }

  const CHUNK_SIZE = 200;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
      const chunk = userIds.slice(i, i + CHUNK_SIZE);

      await Promise.all([
        UserModel.updateMany(
          { _id: { $in: chunk } },
          { $set: { active: false } }
        ).session(session),
        StudentModel.updateMany(
          { userId: { $in: chunk } },
          { $set: { isActive: false } }
        ).session(session),
        StaffModel.updateMany(
          { userId: { $in: chunk } },
          { $set: { isActive: false } }
        ).session(session),
      ]);
    }
    await session.commitTransaction();
    return res.status(HttpStatus.NO_CONTENT).json({
      message: "Users deactivated successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
