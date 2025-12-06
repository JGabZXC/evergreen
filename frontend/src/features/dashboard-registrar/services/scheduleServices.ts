import { apiPrivate } from "../../../config/axiosPrivate";
import type { ScheduleResponse } from "../types";

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

export const getSubjectsOption = async () => {
  const response = await apiPrivate.get("/api/subject?limit=100");
  console.log(response.data);
  return response.data.subjects;
};

export const getSectionsOption = async () => {
  const response = await apiPrivate.get("/api/registrar/classroom?limit=100");
  console.log(response.data);
  return response.data.classrooms;
};

export const getTeachersOption = async () => {
  const response = await apiPrivate.get("/api/teacher?limit=100&isActive=true");
  console.log(response.data);
  return response.data.teachers;
};
