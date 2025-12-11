import { apiPrivate } from "../../../config/axiosPrivate";
import type { CreateCoursePayload } from "../types";

export const getAllCourses = async (
  page = 1,
  limit = 10,
  search = "",
  gradeAvailable = ""
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append("search", search);
  if (gradeAvailable && gradeAvailable !== "ALL")
    queryParams.append("gradeAvailable", gradeAvailable);

  const courses = await apiPrivate.get(`/api/course?${queryParams.toString()}`);
  return courses.data;
};

export const createCourse = async (courseData: CreateCoursePayload) => {
  const response = await apiPrivate.post("/api/course", courseData);
  return response.data;
};

export const updateCourse = async (
  code: string,
  courseData: Partial<CreateCoursePayload>
) => {
  const response = await apiPrivate.patch(`/api/course/${code}`, courseData);
  return response.data;
};
