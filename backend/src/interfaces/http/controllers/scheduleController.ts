import { Response } from "express";
import { ManageClassScheduleUseCase } from "../../../application/use-cases/scheduling/ManageClassScheduleUseCase";
import { HttpStatus } from "../../../domain/HttpStatus";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { BadRequestError } from "../middleware/HttpErrors";
import { BaseClassSchedule } from "../../../domain/ClassSchedule";

const manageClassScheduleUseCase = new ManageClassScheduleUseCase();

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

    // 1. Basic Input Validation
    if (
      !classroomId ||
      !subjectId ||
      !schoolYear ||
      semester === undefined ||
      !schedules
    ) {
      throw new BadRequestError(
        "Missing required fields: classroomId, subjectId, schoolYear, semester, or schedules."
      );
    }

    if (!Array.isArray(schedules)) {
      throw new BadRequestError("Schedules must be an array of time slots.");
    }

    // 2. Construct Data Object
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
