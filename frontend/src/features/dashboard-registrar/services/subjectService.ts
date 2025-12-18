import { apiPrivate } from "../../../config/axiosPrivate";
import type { Subject } from "../../../shared/types/index.ts";
import type { SubjectResponse } from "../types";

export const getAllSubjects = async (
  page = 1,
  limit = 10,
  search = "",
  semesterFilter = "",
  statusFilter = "",
  signal?: AbortSignal
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append("search", search);
  if (semesterFilter && semesterFilter !== "ALL")
    queryParams.append("semester", semesterFilter);
  if (statusFilter && statusFilter !== "ALL") {
    queryParams.append("active", statusFilter === "ACTIVE" ? "true" : "false");
  }

  const response = await apiPrivate.get<SubjectResponse>(
    `/api/subject?${queryParams.toString()}`,
    { signal }
  );
  return response.data;
};

export const createSubject = async (data: Partial<Subject>) => {
  const response = await apiPrivate.post<Subject>("/api/subject", data);
  return response.data;
};

export const updateSubject = async (
  subjectId: string,
  data: Partial<Subject>
) => {
  const response = await apiPrivate.patch<Subject>(
    `/api/subject/${subjectId}`,
    data
  );
  return response.data;
};
