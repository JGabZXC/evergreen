import { Request, Response } from "express";
import {
  CreateCourseUsecase,
  UpdateCourseUseCase,
  GetCourseUseCase,
  GetAllCourseUseCase,
} from "../../../application/use-cases/course";
import { BadRequestError } from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/HttpStatus";
import { AuthenticatedRequest } from "../middleware/authGuard";

const createCourseUseCase = new CreateCourseUsecase();
const updateCourseUseCase = new UpdateCourseUseCase();
const getCourseUseCase = new GetCourseUseCase();
const getAllCoursesUseCase = new GetAllCourseUseCase();

export const getCourse = async (req: Request, res: Response) => {
  let { page = 1, limit = 10, search, gradeAvailable } = req.query;
  const { code: paramCode } = req.params;

  if (paramCode && typeof paramCode !== "string") {
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

    if (paramCode) {
      courses = await getCourseUseCase.execute(paramCode as string);
    } else {
      const filter: Record<string, any> = {};
      if (search) filter.code = String(search);
      if (gradeAvailable) filter.gradeAvailable = String(gradeAvailable);

      courses = await getAllCoursesUseCase.execute(filter, skip, Number(limit));

      console.log(courses);

      if (Number(page) > courses.totalPages && courses.totalDocs > 0) {
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
