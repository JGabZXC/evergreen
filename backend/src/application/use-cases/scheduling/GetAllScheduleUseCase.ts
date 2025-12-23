import { FilterQuery } from "mongoose";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SubjectScheduleDTO } from "../../../interfaces/http/types/SubjectScheduleDTO";
import { SubjectSchedule } from "../../../domain/SubjectSchedule";

export interface FilterSchedule {
  schoolYear?: string;
  semester?: number;
  sectionId?: string;
  teacherId?: string;
  subjectId?: string;
  room?: string;
}

export class GetAllScheduleUseCase {
  async execute(
    filters: FilterSchedule,
    skip = 0,
    limit = 10
  ): Promise<{
    totalDocs: number;
    totalPages: number;
    schedules: SubjectScheduleDTO[];
  }> {
    const query: FilterQuery<FilterSchedule> = {};
    if (filters.schoolYear) query.schoolYear = filters.schoolYear;
    if (filters.semester) query.semester = filters.semester;
    if (filters.teacherId) query["schedules.teacherId"] = filters.teacherId; // Updated to search inside schedules
    if (filters.subjectId) query.subject = filters.subjectId;

    if (filters.room) {
      query["schedules.room"] = filters.room;
    }

    const raw = await SubjectScheduleModel.aggregate([
      {
        $match: query,
      },
      {
        $addFields: {
          schedules: {
            $filter: {
              input: "$schedules",
              as: "schedule",
              cond: { $eq: ["$$schedule.teacherId", filters.teacherId] },
            },
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const [schedules, totalDocs] = await Promise.all([
      SubjectScheduleModel.populate(raw, [
        { path: "subject" },
        { path: "schedules.room" },
        { path: "schedules.teacher" },
      ]) as unknown as SubjectScheduleDTO[],
      SubjectScheduleModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      totalDocs,
      totalPages,
      schedules,
    };
  }
}
