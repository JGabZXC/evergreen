import type {
  ScheduleResponse,
  SubjectResponse,
  TeacherResponse,
  Subject,
  Teacher,
  Section,
  SubjectSchedule,
  SectionResponse,
} from "../types";
import { apiPrivate } from "../../../config/axiosPrivate";

export const getSchedules = async (
  params: {
    page?: number;
    limit?: number;
    schoolYear?: string;
    semester?: number;
    classroomId?: string;
    teacherId?: string;
  },
  signal?: AbortSignal
) => {
  const response = await apiPrivate.get<ScheduleResponse>("/api/schedule", {
    params,
    signal,
  });
  console.log(response.data);
  return response.data;
};

export const createSchedule = async (data: any) => {
  const response = await apiPrivate.post("/api/schedule", data);
  return response.data;
};

export const updateSchedule = async (id: string, data: any) => {
  const response = await apiPrivate.patch(`/api/schedule/${id}`, data);
  return response.data;
};

/**
 * @deprecated Use createSchedule instead
 */
export const createOrUpdateSchedule = createSchedule;

// --- Helper Fetchers for Dropdowns ---

export const getSubjectsOption = async (
  signal?: AbortSignal
): Promise<Subject[]> => {
  const response = await apiPrivate.get<SubjectResponse>(
    "/api/subject?limit=100",
    { signal }
  );
  return response.data.subjects;
};

export const getSectionsOption = async (
  signal?: AbortSignal
): Promise<Section[]> => {
  const response = await apiPrivate.get<SectionResponse>(
    "/api/registrar/classroom?limit=100",
    { signal }
  );
  return response.data.sections;
};

export const getTeachersOption = async (
  signal?: AbortSignal
): Promise<Teacher[]> => {
  const response = await apiPrivate.get<TeacherResponse>(
    "/api/teacher?limit=100&isActive=true",
    { signal }
  );
  return response.data.teachers;
};
