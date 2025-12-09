import { Response } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { BadRequestError } from "../middleware/HttpErrors";
import { BaseClassSchedule } from "../../../domain/ClassSchedule";
import {
  GetAllScheduleUseCase,
  GetScheduleUseCase,
  ManageClassScheduleUseCase,
} from "../../../application/use-cases/scheduling";

const manageClassScheduleUseCase = new ManageClassScheduleUseCase();
const getAllScheduleUseCase = new GetAllScheduleUseCase();
const getScheduleUseCase = new GetScheduleUseCase();

export const getSchedule = async (req: AuthenticatedRequest, res: Response) => {
  let {
    page = 1,
    limit = 10,
    schoolYear,
    semester,
    classroomId,
    teacherId,
    subjectId,
    room,
  } = req.query;
  let { id } = req.params;

  if (id && typeof id !== "string") {
    throw new BadRequestError("Schedule ID is required and must be a string");
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

  const filter: Record<string, string | number> = {};
  if (schoolYear) filter.schoolYear = schoolYear as string;
  if (semester) filter.semester = Number(semester);
  if (classroomId) filter.classroomId = classroomId as string;
  if (teacherId) filter.teacherId = teacherId as string;
  if (subjectId) filter.subjectId = subjectId as string;
  if (room) filter.room = room as string;

  try {
    let schedules;
    if (id) {
      schedules = await getScheduleUseCase.execute(id as string);
    } else {
      schedules = await getAllScheduleUseCase.execute(
        filter,
        skip,
        Number(limit)
      );

      return res.status(HttpStatus.OK).json({ ...schedules });
    }

    return res.status(HttpStatus.OK).json(schedules);
  } catch (err) {
    throw err;
  }
};

export const updateSchedule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      classroomId,
      subjectId,
      teacherId,
      schedules,
      schoolYear,
      semester,
    } = req.body;
    const errors: { [key: string]: string } = {};

    if (!classroomId || !subjectId || !schoolYear || !semester || !schedules) {
      throw new BadRequestError(
        "Missing required fields: classroomId, subjectId, schoolYear, semester, or schedules."
      );
    }

    if (!Array.isArray(schedules) || schedules.length === 0) {
      errors.schedules = "Schedules cannot be empty and must be an array.";
    }

    if (!classroomId) {
      errors.classroomId = "Classroom ID is required.";
    }

    if (!subjectId) {
      errors.subjectId = "Subject ID is required.";
    }
    if (!schoolYear) {
      errors.schoolYear = "School year is required.";
    }
    if (!semester) {
      errors.semester = "Semester is required.";
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestError("Validation errors", errors);
    }

    const scheduleData: BaseClassSchedule = {
      classroomId,
      subjectId,
      teacherId: teacherId || "TBA", // Default to TBA if not provided
      schedules,
      schoolYear,
      semester,
    };

    // 3. Execute Use Case
    const updatedSchedule =
      await manageClassScheduleUseCase.execute(scheduleData);

    // 4. Return Response
    return res.status(HttpStatus.OK).json({
      message: "Class schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    throw error;
  }
};
