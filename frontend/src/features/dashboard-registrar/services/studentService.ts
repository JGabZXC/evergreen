import { apiPrivate } from "../../../config/axiosPrivate";

export const getStudents = async (
  page = 1,
  limit = 10,
  view: "enrolled" | "all" = "enrolled",
  search = ""
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    view,
  });

  if (search) queryParams.append("studentId", search); // Basic ID search for now

  const response = await apiPrivate.get(
    `/api/student?${queryParams.toString()}`
  );
  return response.data;
};

export const getStudent = async (id: string) => {
  const response = await apiPrivate.get(`/api/student/${id}`);
  return response.data;
};
