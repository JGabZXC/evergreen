import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { BadRequestError } from "../middleware/HttpErrors";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import mongoose from "mongoose";

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
