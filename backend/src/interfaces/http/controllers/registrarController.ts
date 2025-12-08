import mongoose from "mongoose";
import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";
import { BadRequestError } from "../middleware/HttpErrors";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { AuthenticatedRequest } from "../middleware/authGuard";
import {
  CreateCourseUsecase,
  GetAllCourseUseCase,
  GetCourseUseCase,
  UpdateCourseUseCase,
} from "../../../application/use-cases/course/index";
import { EnrollStudentUseCase } from "../../../application/use-cases/enrollment";
// ENROLLMENT
const enrollStudentUseCase = new EnrollStudentUseCase();

// COURSE
const createCourseUseCase = new CreateCourseUsecase();
const updateCourseUseCase = new UpdateCourseUseCase();
const getCourseUseCase = new GetCourseUseCase();
const getAllCoursesUseCase = new GetAllCourseUseCase();

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

// COURSE CONTROLLERS
export const getCourse = async (req: Request, res: Response) => {
  let { page = 1, limit = 10 } = req.query;
  const { code } = req.params;

  if (code && typeof code !== "string") {
    throw new BadRequestError("Course code is required and must be a string");
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

  try {
    let courses;

    if (code) {
      courses = await getCourseUseCase.execute(code as string);
    } else {
      courses = await getAllCoursesUseCase.execute(skip, Number(limit));

      if (Number(page) > courses.totalPages) {
        throw new BadRequestError("Page number exceeds total pages");
      }

      return res.status(HttpStatus.OK).json({ ...courses });
    }

    return res.status(HttpStatus.OK).json(courses);
  } catch (err) {
    throw err;
  }
};

export const createCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const bulk = req.query.bulk === "true";

  if (bulk) {
    if (!Array.isArray(req.body)) {
      throw new BadRequestError("Bulk creation requires an array body");
    }

    const results = await Promise.all(
      req.body.map(async (courseData) => {
        try {
          const course = await createCourseUseCase.execute(courseData);
          return { success: true, course };
        } catch (err: any) {
          return {
            success: false,
            course: courseData,
            errors: { general: err.message },
          };
        }
      })
    );

    const successfulCreations = results
      .filter((r) => r.success)
      .map((r) => (r as any).course);

    const failedCreations = results
      .filter((r) => !r.success)
      .map((r) => ({
        course: (r as any).course,
        errors: (r as any).errors,
      }));

    if (successfulCreations.length === 0) {
      throw new BadRequestError("All bulk course creations failed", {
        failedCourses: failedCreations,
      });
    }

    const status =
      failedCreations.length > 0 ? HttpStatus.MULTI_STATUS : HttpStatus.CREATED;

    return res.status(status).json({
      message: `${successfulCreations.length} course(s) created successfully.`,
      successfulCreations,
      failedCreations: failedCreations.length > 0 ? failedCreations : undefined,
    });
  } else {
    try {
      const course = await createCourseUseCase.execute(req.body);
      return res.status(HttpStatus.CREATED).json(course);
    } catch (err: any) {
      throw err;
    }
  }
};

export const updateCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { code } = req.params;

    if (!code || typeof code !== "string") {
      throw new BadRequestError("Course code is required and must be a string");
    }

    const updatedCourse = await updateCourseUseCase.execute(code, req.body);
    return res.status(HttpStatus.OK).json(updatedCourse);
  } catch (err: any) {
    throw err;
  }
};
