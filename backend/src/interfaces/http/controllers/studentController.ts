import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { GetStudentGradesUseCase } from "../../../application/use-cases/student/GetStudentGradesUseCase";
import {
  GetAllStudentUseCase,
  GetStudentUseCase,
  GetAllStudentUseCaseByTeacher,
} from "../../../application/use-cases/student";
import { UpdateStudentProfileUseCase } from "../../../application/use-cases/student/UpdateStudentProfileUseCase";
import { BadRequestError, NotFoundError } from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/HttpStatus";
import { FilterQuery } from "mongoose";
import {
  GetStudentScheduleFilter,
  GetStudentScheduleUseCase,
} from "../../../application/use-cases/student/GetStudentScheduleUseCase";
import { GetStudentEnrollmentHistoryUseCase } from "../../../application/use-cases/student/GetStudentEnrollmentHistoryUseCase";

const getGrades = new GetStudentGradesUseCase();

const getAllStudentUseCase = new GetAllStudentUseCase();
const getAllStudentUseCaseByTeacher = new GetAllStudentUseCaseByTeacher();
const getStudentUseCase = new GetStudentUseCase();
const updateStudentProfileUseCase = new UpdateStudentProfileUseCase();
const getStudentScheduleUseCase = new GetStudentScheduleUseCase();
const getStudentEnrollmentHistoryUseCase = new GetStudentEnrollmentHistoryUseCase();

export const getStudents = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit: queryLimit = 10,
    course,
    studentId,
    view = "enrolled",
    schoolYear,
  } = req.query;
  const { id } = req.params;
  let limit = queryLimit;

  if (id && typeof id !== "string") {
    throw new BadRequestError("Student ID is required and must be a string");
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

  const filter: Record<string, string | number | boolean> = {};
  if (course) filter.course = course as string;
  if (studentId) filter.studentId = studentId as string;
  if (schoolYear) filter.schoolYear = schoolYear as string;

  if (view === "enrolled") {
    filter.isActive = true;
  }

  try {
    let result;
    if (id) {
      result = await getStudentUseCase.execute(id as string);
      return res.status(HttpStatus.OK).json(result);
    } else {
      result = await getAllStudentUseCase.execute(
        filter,
        skip,
        Number(limit),
        view as "enrolled" | "all"
      );

      return res.status(HttpStatus.OK).json({
        ...result,
      });
    }
  } catch (err) {
    throw err;
  }
};

export const getMyGrades = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId } = req.user!; // Get logged-in student's ID

    const grades = await getGrades.execute(studentId!);

    res.status(200).json(grades);
  } catch (error) {
    throw error;
  }
};

export const getMyCurriculumChecklist = async (req: AuthenticatedRequest, res: Response) => {
    const { studentId } = req.user!; // Get logged-in student's ID

    const student = await getStudentUseCase.execute(studentId!);
    return res.status(HttpStatus.OK).json(student.course);
}

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!._id;
    const profileData = req.body;
    const result = await updateStudentProfileUseCase.execute(
      userId,
      profileData
    );
    res.status(HttpStatus.OK).json(result);
  } catch (error) {
    throw error;
  }
};

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { studentId } = req.user!;

    const result = await getAllStudentUseCase.execute(
      { studentId },
      0,
      1,
      "all"
    );

    if (result.students.length === 0) {
      throw new NotFoundError("Student profile not found");
    }

    res.status(HttpStatus.OK).json(result.students[0]);
  } catch (error) {
    throw error;
  }
};

export const getStudentSchedule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // TODO: Add studentId for registrar view later
    const { studentId } = req.user!;
    const { schoolYear, semester } = req.query;

    const filter: FilterQuery<GetStudentScheduleFilter> = {};
    filter.studentId = studentId!;

    if (schoolYear && typeof schoolYear === "string") {
      filter.schoolYear = schoolYear;
    }

    if (semester && !isNaN(Number(semester))) {
      filter.semester = Number(semester);
    }

    const { schedules, enrolledSubjects } =
      await getStudentScheduleUseCase.execute(filter);
    res.status(HttpStatus.OK).json({ schedules, enrolledSubjects });
  } catch (error) {
    throw error;
  }
};

export const updateProfileByRegistrar = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params; // Student ID (_id)
    const profileData = req.body;

    console.log(profileData);

    if(!id || typeof id !== "string") {
      throw new BadRequestError("Student ID is required and must be a string");
    }

    const result = await updateStudentProfileUseCase.execute(
      id,
      profileData,
      false // byUserId = false
    );
    res.status(HttpStatus.OK).json(result);
  } catch (error) {
    throw error;
  }
};

export const getEnrollmentHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Student ID
    let { page = 1, limit = 10 } = req.query;

    if((page && isNaN(Number(page))) || (page && Number(page) < 1)) {
      throw new BadRequestError("Page must be a positive number");
    }
    if((limit && isNaN(Number(limit))) || (limit && Number(limit) < 1)) {
      throw new BadRequestError("Limit must be a positive number");
    }

    if (limit && Number(limit) > 100) {
      limit = 100;
    }

    if (!id || typeof id !== "string") {
      throw new BadRequestError("Student ID is required and must be a string");
    }

    const result = await getStudentEnrollmentHistoryUseCase.execute(
      id,
      Number(page),
      Number(limit)
    );
    res.status(HttpStatus.OK).json(result);
  } catch (error) {
    throw error;
  }
};

export const getStudentsByTeacher = async (
  req: AuthenticatedRequest,
  res: Response
) => {
    const { employeeId } = req.user!;
    const { schoolYear, page = 1, limit = 10 } = req.query;

    if (!employeeId) {
      throw new BadRequestError("User is not a teacher or staff with employeeId");
    }

    if (!schoolYear || typeof schoolYear !== "string") {
      throw new BadRequestError("School Year is required");
    }

    const skip = (Number(page) - 1) * Number(limit);

    const students = await getAllStudentUseCaseByTeacher.execute(
      {
        teacherId: employeeId,
        schoolYear: schoolYear,
      },
      skip,
      Number(limit)
    );

    res.status(HttpStatus.OK).json(students);
};
