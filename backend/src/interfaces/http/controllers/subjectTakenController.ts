import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { BadRequestError, UnauthorizedError } from "../middleware/HttpErrors";
import {
  GetSubjectTakenUseCase,
  UpdateSubjectTakenUseCase,
  GetAllSubjectTakenUseCase,
} from "../../../application/use-cases/subject_taken/index";
import { FilterQuery } from "mongoose";
import { FilterSubjectTaken } from "../../../application/use-cases/subject_taken/GetAllSubjectTakenUseCase";
import { BaseSubjectTaken } from "../../../domain/SubjectTaken";
import { SubjectTakenDTO } from "../types/SubjectTakenDTO";
import { Role, StaffRole, StudentRole } from "../../../domain/types/Role";

const getSubjectTakenUseCase = new GetSubjectTakenUseCase();
const getAllSubjectTakenUseCase = new GetAllSubjectTakenUseCase();
const updateSubjectTakenUseCase = new UpdateSubjectTakenUseCase();

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
    classroomId,
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

  try {
    let subjectsTaken;

    if (id) {
      const filter: FilterQuery<FilterSubjectTaken> = { _id: id };
      if (studentId) filter.studentId = String(studentId);
      subjectsTaken = await getSubjectTakenUseCase.execute(filter);
    } else {
      const filter: FilterQuery<FilterSubjectTaken> = {};
      if (subject) filter.subject = String(subject);
      if (studentId) filter.studentId = String(studentId);
      if (teacherId) filter.teacherId = String(teacherId);
      if (classroomId) filter.classroomId = String(classroomId);
      if (schoolYear) filter.schoolYear = String(schoolYear);
      if (semester) filter.semester = String(semester);
      if (status) filter.status = String(status);

      subjectsTaken = await getAllSubjectTakenUseCase.execute(
        filter,
        skip,
        Number(limit)
      );

      if (
        subjectsTaken.totalPages > Number(page) &&
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
  const {
    subject,
    teacherId,
    studentId,
    classroomId,
    schoolYear,
    semester,
    status,
  } = req.body;

  if (!id || typeof id !== "string") {
    throw new BadRequestError(
      "SubjectTaken ID is required and must be a string"
    );
  }

  try {
    const updateData: Partial<SubjectTakenDTO> = {};
    if (subject) updateData.subject = subject;
    if (teacherId) updateData.teacherId = teacherId;
    if (studentId) updateData.studentId = studentId;
    if (classroomId) updateData.classroomId = classroomId;
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
