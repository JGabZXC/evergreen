import { FilterQuery, PipelineStage } from "mongoose";
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

    const pipeline: PipelineStage.FacetPipelineStage[] = []

    if(filters.teacherId) {
      pipeline.push({
        $addFields: {
          schedules: {
            $filter: {
              input: "$schedules",
              as: "schedule",
              cond: { $eq: ["$$schedule.teacherId", filters.teacherId] },
            },
          },
        },
      });
    }

    pipeline.push({
      $addFields: {
        minSortKey: {
          $min: {
            $map: {
              input: "$schedules",
              as: "sch",
              in: {
                $concat: [
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$$sch.day", "Mon"] }, then: "1" },
                        { case: { $eq: ["$$sch.day", "Tue"] }, then: "2" },
                        { case: { $eq: ["$$sch.day", "Wed"] }, then: "3" },
                        { case: { $eq: ["$$sch.day", "Thu"] }, then: "4" },
                        { case: { $eq: ["$$sch.day", "Fri"] }, then: "5" },
                        { case: { $eq: ["$$sch.day", "Sat"] }, then: "6" },
                        { case: { $eq: ["$$sch.day", "Sun"] }, then: "7" },
                      ],
                      default: "8",
                    },
                  },
                  "$$sch.startTime",
                ],
              },
            },
          },
        },
      },
    });

    pipeline.push({ $sort: { minSortKey: 1 } });

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const [promise] = await SubjectScheduleModel.aggregate([
      { $match: query },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: pipeline
        },
      },
    ]);

    const totalDocs = promise.metadata[0]?.total || 0;
    const schedules = (await SubjectScheduleModel.populate(promise.data, [
      { path: "subject" },
      { path: "schedules.room" },
      { path: "schedules.teacher" },
    ])) as unknown as SubjectScheduleDTO[];

    const dayMap: Record<string, number> = {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
      Sun: 7,
    };

    schedules.forEach((schedule) => {
      schedule.schedules.sort((a, b) => {
        const dayA = dayMap[a.day as string] || 8;
        const dayB = dayMap[b.day as string] || 8;
        if (dayA !== dayB) return dayA - dayB;
        return (a.startTime || "").localeCompare(b.startTime || "");
      });
    });

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      totalDocs,
      totalPages,
      schedules,
    };
  }
}
