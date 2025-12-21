import { apiPrivate } from "../../../config/axiosPrivate";
import type { StudentProfile } from "../../../shared/types";
import type { StudentAggregate } from "../../dashboard-registrar/types";
import type { StudentScheduleResponse } from "../types";

export const getMyProfile = async (): Promise<StudentAggregate> => {
  const response = await apiPrivate.get<StudentAggregate>(
    "/api/student/profile"
  );
  return response.data;
};

export const getMySchedule = async (
  schoolYear?: string,
  semester?: number
): Promise<StudentScheduleResponse> => {
  const params: Record<string, string | number> = {};
  if (schoolYear) params.schoolYear = schoolYear;
  if (semester) params.semester = semester;

  const response = await apiPrivate.get<StudentScheduleResponse>(
    "/api/student/my-schedule",
    { params }
  );
  return response.data;
};

export const updateProfile = async (
  profile: StudentProfile
): Promise<StudentAggregate> => {
  const response = await apiPrivate.patch<StudentAggregate>(
    "/api/student/profile",
    profile
  );
  return response.data;
};
