import type {
  ScheduleResponse,
  SubjectResponse,
  ClassroomResponse,
  TeacherResponse,
  Subject,
  Classroom,
  Teacher,
} from "../types";
import { apiPrivate } from "../../../config/axiosPrivate";

export const getSchedules = async (params: {
  page?: number;
  limit?: number;
  schoolYear?: string;
  semester?: number;
  classroomId?: string;
  teacherId?: string;
}) => {
  const response = await apiPrivate.get<ScheduleResponse>("/api/schedule", {
    params,
  });
  return response.data;
};

export const createOrUpdateSchedule = async (data: any) => {
  const response = await apiPrivate.post("/api/schedule", data);
  return response.data;
};

// --- Helper Fetchers for Dropdowns ---

export const getSubjectsOption = async (): Promise<Subject[]> => {
  const response = await apiPrivate.get<SubjectResponse>(
    "/api/subject?limit=100"
  );
  return response.data.subjects;
};

export const getSectionsOption = async (): Promise<Classroom[]> => {
  const response = await apiPrivate.get<ClassroomResponse>(
    "/api/registrar/classroom?limit=100"
  );
  return response.data.classrooms;
};

export const getTeachersOption = async (): Promise<Teacher[]> => {
  const response = await apiPrivate.get<TeacherResponse>(
    "/api/teacher?limit=100&isActive=true"
  );
  return response.data.teachers;
};
