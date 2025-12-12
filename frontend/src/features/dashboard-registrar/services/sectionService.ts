import { apiPrivate } from "../../../config/axiosPrivate";
import type { CreateSectionPayload, UpdateSectionPayload } from "../types";

export const getAllSections = async (
  page = 1,
  limit = 10,
  search = "",
  gradeLevel = "",
  schoolYear = "",
  capacity = "",
  signal?: AbortSignal
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append("search", search);
  if (gradeLevel && gradeLevel !== "ALL")
    queryParams.append("gradeLevel", gradeLevel);
  if (schoolYear) queryParams.append("schoolYear", schoolYear);
  if (capacity) queryParams.append("capacity", capacity);

  const response = await apiPrivate.get(
    `/api/registrar/sections?${queryParams.toString()}`,
    {
      signal,
    }
  );
  return response.data;
};

export const createSection = async (sectionData: CreateSectionPayload) => {
  const response = await apiPrivate.post(
    "/api/registrar/sections",
    sectionData
  );
  return response.data;
};

export const updateSection = async (
  id: string,
  sectionData: UpdateSectionPayload
) => {
  const response = await apiPrivate.patch(
    `/api/registrar/sections/${id}`,
    sectionData
  );
  return response.data;
};
