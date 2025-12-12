import { apiPrivate } from "../../../config/axiosPrivate";
import type { TeacherResponse } from "../types";

export const getAllTeachers = async (
  page = 1,
  limit = 10,
  isActive = true,
  signal?: AbortSignal
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    isActive: isActive.toString(),
  });

  const response = await apiPrivate.get<TeacherResponse>(
    `/api/teacher?${queryParams.toString()}`,
    {
      signal,
    }
  );
  return response.data;
};
