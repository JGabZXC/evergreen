import mongoose from "mongoose";
import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { BadRequestError } from "../middleware/HttpErrors";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { StaffRole } from "../../../domain/types/Role";
import {
  CreateSubjectUseCase,
  GetAllSubjectUseCase,
  GetSubjectUseCase,
  UpdateSubjectUseCase,
} from "../../../application/use-cases/subject/index";
import {
  CreateCourseUsecase,
  GetAllCourseUseCase,
  GetCourseUseCase,
  UpdateCourseUseCase,
} from "../../../application/use-cases/course/index";
import {
  UpdateClassroomUseCase,
  GetAllClassroomUseCase,
  GetClassroomUseCase,
  CreateClassroomUseCase,
} from "../../../application/use-cases/classroom/index";

// SUBJECT
const createSubjectUseCase = new CreateSubjectUseCase();
const getSubjectUseCase = new GetSubjectUseCase();
const getAllSubjectUseCase = new GetAllSubjectUseCase();
const updateSubjectUseCase = new UpdateSubjectUseCase();
// COURSE
const createCourseUseCase = new CreateCourseUsecase();
const updateCourseUseCase = new UpdateCourseUseCase();
const getCourseUseCase = new GetCourseUseCase();
const getAllCoursesUseCase = new GetAllCourseUseCase();
// CLASSROOM
const getAllClassroomUseCase = new GetAllClassroomUseCase();
const getClassroomUsecase = new GetClassroomUseCase();
const createClassroomUseCase = new CreateClassroomUseCase();
const updateClassroomUseCase = new UpdateClassroomUseCase();

export const getAllStudents = async (req: Request, res: Response) => {
  let { page = 1, limit = 10 } = req.query;

  if (Number(page) < 1 || Number(limit) < 1) {
    throw new BadRequestError("Page and limit must be positive integers");
  }

  if (Number(limit) > 100) {
    limit = 100;
  }

  const skip = (Number(page) - 1) * Number(limit);

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

// SUBJECT CONTROLLERS
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

export const getSubject = async (req: Request, res: Response) => {
  let { page = 1, limit = 10 } = req.query;
  let { subjectId } = req.params;

  if (subjectId && typeof subjectId !== "string") {
    throw new BadRequestError("Subject ID must be a string");
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
    let subjects;

    if (subjectId) {
      subjects = await getSubjectUseCase.execute(subjectId as string);
    } else {
      subjects = await getAllSubjectUseCase.execute(skip, Number(limit));

      if (Number(page) > subjects.totalPages) {
        throw new BadRequestError("Page number exceeds total pages");
      }

      return res.status(HttpStatus.OK).json({ ...subjects });
    }

    return res.status(HttpStatus.OK).json(subjects);
  } catch (err) {
    throw err;
  }
};

export const updateSubject = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId || typeof subjectId !== "string") {
      throw new BadRequestError("Subject ID is required and must be a string");
    }
    const updatedSubject = await updateSubjectUseCase.execute(
      subjectId,
      req.body
    );
    return res.status(HttpStatus.OK).json(updatedSubject);
  } catch (err) {
    throw err;
  }
};

// CLASSROOM CONTROLLERS
export const createClassroom = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const createdClassroom = await createClassroomUseCase.execute(req.body);
    return res.status(HttpStatus.CREATED).json(createdClassroom);
  } catch (err) {
    throw err;
  }
};

export const getClassroom = async (req: Request, res: Response) => {
  let { page = 1, limit = 10 } = req.query;
  let { id } = req.params;

  if (id && typeof id !== "string") {
    throw new BadRequestError("Classroom ID must be a string");
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
    let classrooms;
    if (id) {
      classrooms = await getClassroomUsecase.execute(id as string);
    } else {
      classrooms = await getAllClassroomUseCase.execute(skip, Number(limit));
      if (Number(page) > classrooms.totalPages) {
        throw new BadRequestError("Page number exceeds total pages");
      }
      return res.status(HttpStatus.OK).json({ ...classrooms });
    }
    return res.status(HttpStatus.OK).json(classrooms);
  } catch (err) {
    throw err;
  }
};

export const updateClassroom = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new BadRequestError(
        "Classroom ID is required and must be a string"
      );
    }
    const updatedClassroom = await updateClassroomUseCase.execute(id, req.body);
    return res.status(HttpStatus.OK).json(updatedClassroom);
  } catch (err) {
    throw err;
  }
};

// COURSE CONTROLLERS
export const getCourse = async (req: Request, res: Response) => {
  let { page = 1, limit = 10 } = req.query;
  let { code } = req.params;

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
