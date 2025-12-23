import { FilterQuery } from "mongoose";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SubjectScheduleDTO } from "../../../interfaces/http/types/SubjectScheduleDTO";

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

    const [promise] = await SubjectScheduleModel.aggregate([
      { $match: query },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
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
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);

    const totalDocs = promise.metadata[0]?.total || 0;
    const schedules = (await SubjectScheduleModel.populate(promise.data, [
      { path: "subject" },
      { path: "schedules.room" },
      { path: "schedules.teacher" },
    ])) as unknown as SubjectScheduleDTO[];

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      totalDocs,
      totalPages,
      schedules,
    };
  }
}
