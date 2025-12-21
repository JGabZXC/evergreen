import { FilterQuery } from "mongoose";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { SubjectDTO } from "../../../interfaces/http/types/SubjectDTO";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SubjectTakenDTO } from "../../../interfaces/http/types/SubjectTakenDTO";
import { SubjectScheduleDTO } from "../../../interfaces/http/types/SubjectScheduleDTO";
import { StaffDTO } from "../../../interfaces/http/types/StaffDTO";
import { RoomDTO } from "../../../interfaces/http/types/RoomDTO";

export interface GetStudentScheduleFilter {
  studentId: string;
  schoolYear?: string;
  semester?: number;
}

type SubjectTakenScheduleDTO = Omit<
  SubjectTakenDTO,
  "subject" | "classroomId"
> & {
  subject: SubjectDTO;
  classroomId: string;
};

type SubjectScheduleWithTeacherDTO = Omit<
  SubjectScheduleDTO,
  "subject" | "schedules"
> & {
  subject: string;
  schedules: {
    day: string;
    startTime: string;
    endTime: string;
    room: RoomDTO;
  };
};

export class GetStudentScheduleUseCase {
  async execute(filter: FilterQuery<GetStudentScheduleFilter>) {
    const student = await StudentModel.findOne({ studentId: filter.studentId });
    if (!student) throw new NotFoundError("Student not found");

    const enrolledSubjects = await SubjectTakenModel.find(filter)
      .populate("subject")
      .lean<SubjectTakenScheduleDTO[]>();

    if (!enrolledSubjects.length)
      return { schedules: [], enrolledSubjects: [] };

    const subjectIds = enrolledSubjects.map((s) => s.subject._id);
    const schedules = await SubjectScheduleModel.find({
      subject: { $in: subjectIds },
      ...(filter.schoolYear && { schoolYear: filter.schoolYear }),
      ...(filter.semester && { semester: filter.semester }),
    })
      .populate({ path: "teacher", populate: { path: "userId" } })
      .populate("schedules.room")
      .lean<SubjectScheduleWithTeacherDTO[]>();

    return { schedules, enrolledSubjects };
  }
}
