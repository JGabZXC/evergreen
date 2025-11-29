import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentModel } from "../../../infrastructure/database/StudentModel";

export const getAllStudents = async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const [students, totalDocs] = await Promise.all([
      StudentModel.find()
        .populate({
          path: "userId",
          match: { active: true },
        })
        .skip(skip)
        .limit(Number(limit)),
      StudentModel.countDocuments(),
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
