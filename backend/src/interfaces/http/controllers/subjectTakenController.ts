import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { BadRequestError } from "../middleware/HttpErrors";
import {
  GetSubjectTakenUseCase,
  UpdateSubjectTakenUseCase,
  GetAllSubjectTakenUseCase,
  BatchGradeSubjectTakenUseCase,
} from "../../../application/use-cases/subject_taken/index";
import { FilterQuery } from "mongoose";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { FilterSubjectTaken } from "../../../application/use-cases/subject_taken/GetAllSubjectTakenUseCase";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import { SubjectTakenDTO } from "../types/SubjectTakenDTO";

const getSubjectTakenUseCase = new GetSubjectTakenUseCase();
const getAllSubjectTakenUseCase = new GetAllSubjectTakenUseCase();
const updateSubjectTakenUseCase = new UpdateSubjectTakenUseCase();
const batchGradeSubjectTakenUseCase = new BatchGradeSubjectTakenUseCase();

export const getSubjectTaken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  let {
    page = 1,
    limit = 10,
    subject,
    studentId,
    teacherId,
    scheduleId,
    schoolYear,
    semester,
    status,
  } = req.query;
  const { id } = req.params;

  if (id && typeof id !== "string") {
    throw new BadRequestError("SubjectTaken ID must be a string");
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

  if (req.user!.role === StudentRole.Student) {
    studentId = req.user!.studentId;
  }

  if (req.user!.role === StaffRole.Teacher) {
    teacherId = req.user!.employeeId || "";
  }

  try {
    let subjectsTaken;

    if (id) {
      const filter: FilterQuery<FilterSubjectTaken> = { _id: id };
      if (studentId) filter.studentId = studentId;
      subjectsTaken = await getSubjectTakenUseCase.execute(filter);
    } else {
      const filter: FilterQuery<FilterSubjectTaken> = {};

      if (req.user!.role === StaffRole.Teacher) {
        teacherId = req.user!.employeeId || "";
      }

      if (subject) filter.subject = subject;
      if (studentId) filter.studentId = studentId;

      // If filtering by teacher, we must find the schedules first
      if (teacherId) {
        const schedules = await SubjectScheduleModel.find({
          "schedules.teacherId": teacherId,
        }).select("_id");
        const scheduleIds = schedules.map((s) => s._id);
        filter.scheduleId = { $in: scheduleIds };
      }

      if (scheduleId) filter.scheduleId = scheduleId;
      if (schoolYear) filter.schoolYear = schoolYear;
      if (semester) filter.semester = semester;
      if (status) filter.status = status;

      subjectsTaken = await getAllSubjectTakenUseCase.execute(
        filter,
        skip,
        Number(limit)
      );

      if (
        Number(page) > subjectsTaken.totalPages &&
        subjectsTaken.totalDocs > 0
      ) {
        throw new BadRequestError("Page number exceeds total pages available");
      }

      return res.status(200).json({ ...subjectsTaken });
    }
  } catch (err) {
    throw err;
  }
};

export const updateSubjectTaken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  let { subject, studentId, scheduleId, schoolYear, semester, status } =
    req.body;

  if (!id || typeof id !== "string") {
    throw new BadRequestError(
      "SubjectTaken ID is required and must be a string"
    );
  }

  try {
    const updateData: Partial<SubjectTakenDTO> = {};
    if (subject) updateData.subject = subject;
    if (studentId) updateData.studentId = studentId;
    if (scheduleId) updateData.scheduleId = scheduleId;
    if (schoolYear) updateData.schoolYear = schoolYear;
    if (semester) updateData.semester = semester;
    if (status) updateData.status = status;

    const updatedSubjectTaken = await updateSubjectTakenUseCase.execute(
      id,
      updateData
    );

    return res.status(200).json(updatedSubjectTaken);
  } catch (err) {
    throw err;
  }
};

export const batchGradeSubjectTaken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { grades } = req.body;

    if (!Array.isArray(grades)) {
      throw new BadRequestError("Grades must be an array");
    }

    await batchGradeSubjectTakenUseCase.execute(grades);

    return res.status(200).json({ message: "Grades updated successfully" });
  } catch (err) {
    throw err;
  }
};
