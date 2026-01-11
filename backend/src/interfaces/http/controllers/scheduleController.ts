import {Response} from "express";
import {HttpStatus} from "../../../domain/HttpStatus";
import {AuthenticatedRequest} from "../middleware/authGuard";
import {BadRequestError} from "../middleware/HttpErrors";
import {BaseSubjectSchedule} from "../../../domain/SubjectSchedule";
import {
    GetAllScheduleUseCase,
    GetScheduleUseCase,
    ManageSubjectScheduleUseCase,
    UpdateSubjectScheduleUseCase,
} from "../../../application/use-cases/scheduling";
import {StaffRole} from "../../../domain/types/Role";
import {FilterQuery} from "mongoose";
import {FilterSchedule} from "../../../application/use-cases/scheduling/GetAllScheduleUseCase";

const manageSubjectScheduleUseCase = new ManageSubjectScheduleUseCase();
const getAllScheduleUseCase = new GetAllScheduleUseCase();
const getScheduleUseCase = new GetScheduleUseCase();
const updateSubjectScheduleUseCase = new UpdateSubjectScheduleUseCase();

export const getSchedule = async (req: AuthenticatedRequest, res: Response) => {
    let {
        page = 1,
        limit = 10,
        schoolYear,
        semester,
        teacherId,
        subjectId,
        room,
    } = req.query;
    let {id} = req.params;

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

    const filter: FilterQuery<FilterSchedule> = {};

    if (req.user?.role === StaffRole.Teacher) {
        filter.teacherId = req.user.employeeId || "";
    } else {
        filter.teacherId = teacherId
    }
    if (schoolYear) filter.schoolYear = schoolYear;
    if (semester) filter.semester = Number(semester);
    if (teacherId) filter.teacherId = teacherId;
    if (subjectId) filter.subjectId = subjectId;
    if (room) filter.room = room;


    let schedules;
    if (id) {
        schedules = await getScheduleUseCase.execute(id);
    } else {
        schedules = await getAllScheduleUseCase.execute(
            filter,
            skip,
            Number(limit)
        );

        return res.status(HttpStatus.OK).json({...schedules});
    }

    return res.status(HttpStatus.OK).json(schedules);
};

export const createSchedule = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const {subject, schedules, schoolYear, semester} = req.body;
    const errors: { [key: string]: string } = {};

    if (!subject || !schoolYear || !semester || !schedules) {
        throw new BadRequestError(
            "Missing required fields: subjectId, schoolYear, semester, or schedules."
        );
    }

    if (!Array.isArray(schedules) || schedules.length === 0) {
        errors.schedules = "Schedules cannot be empty and must be an array.";
    }

    if (!subject) {
        errors.subject = "Subject ID is required.";
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

    const scheduleData: BaseSubjectSchedule = {
        subject,
        schedules,
        schoolYear,
        semester,
    };

    const updatedSchedule =
        await manageSubjectScheduleUseCase.execute(scheduleData);

    return res.status(HttpStatus.OK).json({
        ...updatedSchedule,
    });
};

export const updateSchedule = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const {id} = req.params;
    const updates = req.body;

    if (!id) {
        throw new BadRequestError("Schedule ID is required");
    }

    const updatedSchedule = await updateSubjectScheduleUseCase.execute(
        id,
        updates
    );

    return res.status(HttpStatus.OK).json({
        ...updatedSchedule,
    });

};
