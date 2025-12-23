import { Request, Response } from "express";
import {
  CreateSectionUseCase,
  GetAllSectionUseCase,
  GetSectionUseCase,
  UpdateSectionUseCase,
} from "../../../application/use-cases/section";
import { GetStudentsBySectionUseCase } from "../../../application/use-cases/section/GetStudentsBySectionUseCase";
import { HttpStatus } from "../../../domain/HttpStatus";
import { BadRequestError } from "../middleware/HttpErrors";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { StaffModel } from "../../../infrastructure/database/StaffModel";

const createSectionUseCase = new CreateSectionUseCase();
const getAllSectionUseCase = new GetAllSectionUseCase();
const getSectionUseCase = new GetSectionUseCase();
const updateSectionUseCase = new UpdateSectionUseCase();
const getStudentsBySectionUseCase = new GetStudentsBySectionUseCase();

export const createSection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { adviserId, name, gradeLevel, schoolYear, designatedRoom } =
      req.body;
    let errors: { [key: string]: string } = {};
    if (!adviserId || typeof adviserId !== "string") {
      errors.adviserId = "Adviser ID is required and must be a string";
    } else if (
      adviserId !== "TBA" &&
      (await StaffModel.findOne({ employeeId: adviserId })) === null
    ) {
      errors.adviserId = "Adviser ID does not exist";
    }

    if (!name || typeof name !== "string") {
      errors.name = "Classroom name is required and must be a string";
    }

    if (!gradeLevel || typeof gradeLevel !== "string") {
      errors.gradeLevel = "Grade level is required and must be a string";
    }

    if (designatedRoom && typeof designatedRoom !== "string") {
      errors.designatedRoom = "Designated room must be a string";
    }

    if (!schoolYear || typeof schoolYear !== "string") {
      errors.schoolYear = "School year is required and must be a string";
    } else if (!/^\d{4}-\d{4}$/.test(schoolYear)) {
      errors.schoolYear = "School year must be in the format YYYY-YYYY";
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestError("Validation failed", errors);
    }

    const newData = { ...req.body };
    if (adviserId === "TBA") {
      newData.adviserId = undefined;
    }

    const createdSection = await createSectionUseCase.execute(newData);
    return res.status(HttpStatus.CREATED).json(createdSection);
  } catch (err) {
    throw err;
  }
};

export const getSection = async (req: Request, res: Response) => {
  let {
    page = 1,
    limit = 10,
    search,
    gradeLevel,
    schoolYear,
    capacity,
    adviserId,
  } = req.query;
  let { id } = req.params;

  if (id && typeof id !== "string") {
    throw new BadRequestError("Section ID must be a string");
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
    let sections;
    if (id) {
      sections = await getSectionUseCase.execute(id as string);
    } else {
      const queryFilter: Record<
        string,
        string | number | Record<string, unknown>
      > = {};

      if (search && typeof search === "string") {
        queryFilter.search = search;
      }

      if (gradeLevel && typeof gradeLevel === "string") {
        queryFilter.gradeLevel = gradeLevel;
      }

      if (schoolYear && typeof schoolYear === "string") {
        queryFilter.schoolYear = schoolYear;
      }

      if (capacity && !isNaN(Number(capacity))) {
        queryFilter.capacity = Number(capacity);
      }

      if (adviserId && typeof adviserId === "string") {
        queryFilter.adviserId = adviserId;
      }

      sections = await getAllSectionUseCase.execute(
        queryFilter,
        skip,
        Number(limit)
      );
      return res.status(HttpStatus.OK).json({ ...sections });
    }
    return res.status(HttpStatus.OK).json(sections);
  } catch (err) {
    throw err;
  }
};

export const updateSection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new BadRequestError("Section ID is required and must be a string");
    }
    const updatedSection = await updateSectionUseCase.execute(id, req.body);
    return res.status(HttpStatus.OK).json(updatedSection);
  } catch (err) {
    throw err;
  }
};

export const getSectionStudents = async (req: Request, res: Response) => {
  try {
    const { semester }: { semester?: string } = req.query;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      throw new BadRequestError("Section ID is required and must be a string");
    }

    if (semester && isNaN(Number(semester))) {
      throw new BadRequestError("Semester must be a number");
    }

    const semesterNumber = semester ? Number(semester) : undefined;

    const students = await getStudentsBySectionUseCase.execute(
      id,
      semesterNumber
    );
    res.status(HttpStatus.OK).json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
