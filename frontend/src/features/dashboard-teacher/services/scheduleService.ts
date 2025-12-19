import { apiPrivate } from "../../../config/axiosPrivate";
import type { SubjectSchedule } from "../../../shared/types/index.ts";

export const getTeacherSchedule = async (
  schoolYear?: string
): Promise<SubjectSchedule[]> => {
  const params: Record<string, string> = {};
  if (schoolYear) params.schoolYear = schoolYear;

  const { data } = await apiPrivate.get("/api/schedule", { params });
  return data.schedules;
};
