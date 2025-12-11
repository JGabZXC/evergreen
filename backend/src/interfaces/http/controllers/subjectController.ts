import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { BadRequestError } from "../middleware/HttpErrors";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { StaffRole } from "../../../domain/types/Role";
import {
  CreateSubjectUseCase,
  GetAllSubjectUseCase,
  GetSubjectUseCase,
  UpdateSubjectUseCase,
} from "../../../application/use-cases/subject";

const createSubjectUseCase = new CreateSubjectUseCase();
const getSubjectUseCase = new GetSubjectUseCase();
const getAllSubjectUseCase = new GetAllSubjectUseCase();
const updateSubjectUseCase = new UpdateSubjectUseCase();

export const createSubject = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name, subjectId, description, semesterAvailable } = req.body;
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
      { name, subjectId, description, semesterAvailable },
      employeeId
    );

    return res.status(HttpStatus.CREATED).json(subject);
  } catch (err) {
    throw err;
  }
};

export const getSubject = async (req: Request, res: Response) => {
  let { page = 1, limit = 10, semester, active, search } = req.query;
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
      const filter: any = {};
      if (semester) filter.semester = Number(semester);
      if (active !== undefined) filter.active = active === "true";
      if (search) filter.subjectId = String(search);

      subjects = await getAllSubjectUseCase.execute(
        filter,
        skip,
        Number(limit)
      );

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
    const { name, subjectId, description, semesterAvailable, active } =
      req.body;
    const { subjectId: paramSubjectId } = req.params;
    if (!paramSubjectId || typeof paramSubjectId !== "string") {
      throw new BadRequestError("Subject ID is required and must be a string");
    }

    const updatedSubject = await updateSubjectUseCase.execute(paramSubjectId, {
      name,
      subjectId,
      description,
      semesterAvailable,
      active,
    });
    return res.status(HttpStatus.OK).json(updatedSubject);
  } catch (err) {
    throw err;
  }
};
