import { SubjectSchedule } from "../../../domain/SubjectSchedule";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SubjectScheduleDTO } from "../../../interfaces/http/types/SubjectScheduleDTO";

interface FilterSchedule {
  schoolYear?: string;
  semester?: number;
  sectionId?: string; // Filter by Section
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
    // if (filters.sectionId) query.sectionId = filters.sectionId; // Removed sectionId
    if (filters.teacherId) query["schedules.teacherId"] = filters.teacherId; // Updated to search inside schedules
    if (filters.subjectId) query.subject = filters.subjectId;

    if (filters.room) {
      query["schedules.room"] = filters.room;
    }

    const [schedules, totalDocs] = await Promise.all([
      SubjectScheduleModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("subject")
        // .populate("section") // Removed
        // .populate({ // Removed top-level teacher
        //   path: "teacher",
        //   populate: "userId",
        // })
        .populate("schedules.room")
        .populate({
          path: "schedules.teacher",
          populate: { path: "userId" }, // Assuming Staff has userId ref
        })
        .lean<SubjectScheduleDTO[]>(),
      SubjectScheduleModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return { totalDocs, totalPages, schedules };
  }
}
