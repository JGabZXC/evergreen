import { apiPrivate } from "../../../config/axiosPrivate";
import type { Subject, SubjectResponse } from "../types";

export const getAllSubjects = async (
  page = 1,
  limit = 10,
  search = "",
  gradeFilter = "",
  statusFilter = ""
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append("search", search);
  if (gradeFilter && gradeFilter !== "ALL")
    queryParams.append("targetGradeLevels", gradeFilter);
  if (statusFilter && statusFilter !== "ALL") {
    queryParams.append("active", statusFilter === "ACTIVE" ? "true" : "false");
  }

  const response = await apiPrivate.get<SubjectResponse>(
    `/api/subject?${queryParams.toString()}`
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
