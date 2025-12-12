import { SubjectSchedule } from "../../../domain/SubjectSchedule";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SubjectScheduleDTO } from "../../../interfaces/http/types/SubjectScheduleDTO";

interface FilterSchedule {
  schoolYear?: string;
  semester?: number;
  classroomId?: string; // Filter by Section
  teacherId?: string; // Filter by Teacher
  subjectId?: string; // Filter by Subject
  room?: string; // Filter by Physical Room (New)
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
    const query: Record<string, string | number> = {};
    if (filters.schoolYear) query.schoolYear = filters.schoolYear;
    if (filters.semester) query.semester = filters.semester;
    if (filters.classroomId) query.classroomId = filters.classroomId;
    if (filters.teacherId) query.teacherId = filters.teacherId;
    if (filters.subjectId) query.subject = filters.subjectId;

    if (filters.room) {
      query["schedules.room"] = filters.room;
    }

    const [schedules, totalDocs] = await Promise.all([
      SubjectScheduleModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("classroomId")
        .populate("subject")
        .populate({
          path: "teacher",
          populate: "userId",
        })
        .lean<SubjectScheduleDTO[]>(),
      SubjectScheduleModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return { totalDocs, totalPages, schedules };
  }
}
