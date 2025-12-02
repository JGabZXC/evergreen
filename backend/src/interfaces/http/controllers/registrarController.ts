import mongoose from "mongoose";
import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { BadRequestError } from "../middleware/HttpErrors";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { StaffRole } from "../../../domain/types/Role";
import { CreateSubjectUseCase } from "../../../application/use-cases/CreateSubjectUseCase";

const createSubjectUseCase = new CreateSubjectUseCase();

export const getAllStudents = async (req: Request, res: Response) => {
  let { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  if (Number(page) < 1 || Number(limit) < 1) {
    throw new BadRequestError("Page and limit must be positive integers");
  }

  if (Number(limit) > 100) {
    limit = 100;
  }

  try {
    const [students, totalDocs] = await Promise.all([
      StudentModel.find({ isActive: true }).skip(skip).limit(Number(limit)),
      StudentModel.countDocuments({ isActive: true }),
    ]);
    const totalPages = Math.ceil(totalDocs / Number(limit));

    if (Number(page) > totalPages)
      throw new BadRequestError("Page number exceeds total pages");

    return res.status(HttpStatus.OK).json({
      totalDocs,
      totalPages,
      page: Number(page),
      students,
    });
  } catch (err) {
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

export const createSubject = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name, subjectId, description, targetGradeLevels, semesterAvailable } =
    req.body;
  const bulk = req.query.bulk === "true";

  try {
    if (req.user?.role !== StaffRole.Registrar) {
      throw new BadRequestError("Only Registrar can create subjects");
    }

    if (!req.user.employeeId) {
      throw new BadRequestError("User does not have an associated employeeId");
    }

    const employeeId = req.user.employeeId;

    if (bulk) {
      if (!Array.isArray(req.body)) {
        throw new BadRequestError("Bulk creation requires an array body");
      }

      const results = await Promise.all(
        req.body.map(async (subjectData) => {
          try {
            const subject = await createSubjectUseCase.execute(
              subjectData,
              employeeId
            );
            return { success: true, subject };
          } catch (err: any) {
            return {
              success: false,
              subject: subjectData,
              errors: { general: err.message },
            };
          }
        })
      );

      const successfulCreations = results
        .filter((r) => r.success)
        .map((r) => (r as any).subject);

      const failedCreations = results
        .filter((r) => !r.success)
        .map((r) => ({
          subject: (r as any).subject,
          errors: (r as any).errors,
        }));

      if (successfulCreations.length === 0) {
        throw new BadRequestError("All bulk subject creations failed", {
          failedSubjects: failedCreations,
        });
      }

      const status =
        failedCreations.length > 0
          ? HttpStatus.MULTI_STATUS
          : HttpStatus.CREATED;

      return res.status(status).json({
        message: `${successfulCreations.length} subject(s) created successfully.`,
        successfulCreations,
        failedCreations:
          failedCreations.length > 0 ? failedCreations : undefined,
      });
    }

    const subject = await createSubjectUseCase.execute(
      { name, subjectId, description, targetGradeLevels, semesterAvailable },
      employeeId
    );

    return res.status(HttpStatus.CREATED).json(subject);
  } catch (err) {
    throw err;
  }
};
