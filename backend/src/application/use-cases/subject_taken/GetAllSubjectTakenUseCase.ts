import { FilterQuery } from "mongoose";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { SubjectTakenDTO } from "../../../interfaces/http/types/SubjectTakenDTO";

export interface FilterSubjectTaken {
  subject?: string;
  studentId?: string;
  teacherId?: string;
  classroomId?: string; // Room
  schoolYear?: string;
  semester?: string;
  status?: string;
}

export class GetAllSubjectTakenUseCase {
  async execute(filter: FilterSubjectTaken, skip = 0, limit = 10) {
    const [subjectTakens, totalDocs] = await Promise.all([
      SubjectTakenModel.find(filter)
        .skip(skip)
        .limit(limit)
        .lean<SubjectTakenDTO[]>(),
      SubjectTakenModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return { totalDocs, totalPages, subjectTakens };
  }
}
