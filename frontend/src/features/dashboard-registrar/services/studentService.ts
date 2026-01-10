import { apiPrivate } from "../../../config/axiosPrivate";
import type { StudentAggregate, StudentResponse } from "../types";

export const getStudents = async (
  page = 1,
  limit = 10,
  view: "enrolled" | "all" = "enrolled",
  search = "",
  schoolYear = ""
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    view,
  });

  if (search) queryParams.append("studentId", search); // Basic ID search for now
  if (schoolYear) queryParams.append("schoolYear", schoolYear);

  const response = await apiPrivate.get<StudentResponse>(
    `/api/student?${queryParams.toString()}`
  );
  return response.data;
};

export const getStudent = async (id: string) => {
  const response = await apiPrivate.get<StudentAggregate>(`/api/student/${id}`);
  return response.data;
};

export const updateStudentProfile = async (
  id: string,
  data: Partial<NonNullable<StudentAggregate["profile"]>>
) => {
  const response = await apiPrivate.patch(`/api/student/${id}/profile`, data);
  return response.data;
};

export const getStudentEnrollmentHistory = async (
  id: string,
  page = 1,
  limit = 10
) => {
  const response = await apiPrivate.get(
    `/api/student/${id}/enrollment-history`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};
