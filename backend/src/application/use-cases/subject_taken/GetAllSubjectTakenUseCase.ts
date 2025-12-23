import { FilterQuery } from "mongoose";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { SubjectTakenDTO } from "../../../interfaces/http/types/SubjectTakenDTO";
import { SubjectStatus } from "../../../domain/SubjectTaken";

export interface FilterSubjectTaken {
  subject?: string;
  studentId?: string;
  teacherId?: string;
  scheduleId?: string;
  schoolYear?: string;
  semester?: number;
  status?: SubjectStatus;
}

export class GetAllSubjectTakenUseCase {
  async execute(filter: FilterQuery<FilterSubjectTaken>, skip = 0, limit = 10) {
    console.log("😂😂😂", filter);
    const [subjectTakens, totalDocs] = await Promise.all([
      SubjectTakenModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("subject")
        .populate("student")
        .populate({
          path: "scheduleId",
          populate: { path: "schedules.teacher" }, // Populate teacher inside schedule
        })
        .lean<SubjectTakenDTO[]>(),
      SubjectTakenModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return { totalDocs, totalPages, subjectTakens };
  }
}
