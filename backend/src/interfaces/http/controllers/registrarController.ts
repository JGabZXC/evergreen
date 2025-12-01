import mongoose from "mongoose";
import e, { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { BadRequestError } from "../middleware/HttpErrors";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { SubjectService } from "../../../application/services/subjectService";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { StaffRole } from "../../../domain/types/Role";
import { BaseSubject } from "../../../domain/Subject";

const subjectService = new SubjectService();

export const getAllStudents = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const [students, totalDocs] = await Promise.all([
      StudentModel.find({ isActive: true }).skip(skip).limit(Number(limit)),
      StudentModel.countDocuments({ isActive: true }),
    ]);
    const totalPages = Math.ceil(totalDocs / Number(limit));
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

      const createdSubjects = await Promise.all(
        req.body.map((subjectData) =>
          subjectService.createSubject(subjectData, employeeId)
        )
      );

      const successfulCreations = createdSubjects.filter((s) => s !== null);
      const failedCreations = createdSubjects.filter((s) => s === null);

      if (successfulCreations.length === 0) {
        throw new BadRequestError("All bulk subject creations failed");
      }

      const status =
        successfulCreations.length === createdSubjects.length
          ? HttpStatus.CREATED
          : HttpStatus.PARTIAL_CONTENT;

      return res.status(status).json({
        message: `${successfulCreations.length} subject(s) created successfully.`,
        successfulCreations,
        failedCreations:
          failedCreations.length > 0 ? failedCreations : undefined,
      });
    }

    const subject = await subjectService.createSubject(
      { name, subjectId, description, targetGradeLevels, semesterAvailable },
      employeeId
    );

    return res.status(HttpStatus.CREATED).json(subject);
  } catch (err) {
    throw err;
  }
};
