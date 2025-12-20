import { apiPrivate } from "../../../config/axiosPrivate";
import type {
  Student,
  StudentProfile,
  SubjectTaken,
  SubjectSchedule,
} from "../../../shared/types";

export const studentService = {
  updateProfile: async (profile: StudentProfile): Promise<StudentProfile> => {
    const response = await apiPrivate.patch("/api/student/profile", profile);
    return response.data;
  },

  createProfile: async (profile: StudentProfile): Promise<StudentProfile> => {
    const response = await apiPrivate.patch("/api/student/profile", profile);
    return response.data;
  },

  getDashboardData: async (): Promise<Student> => {
    const response = await apiPrivate.get<Student>("/api/student/profile");
    return response.data;
  },

  getGrades: async (): Promise<SubjectTaken[]> => {
    const response = await apiPrivate.get<SubjectTaken[]>(
      "/api/student/my-grades"
    );
    return response.data;
  },

  getSchedules: async (
    schoolYear: string,
    semester: number
  ): Promise<{ schedules: SubjectSchedule[] }> => {
    const response = await apiPrivate.get<{ schedules: SubjectSchedule[] }>(
      "/api/schedule",
      {
        params: { schoolYear, semester, limit: 100 }, // Fetch enough schedules
      }
    );
    return response.data;
  },
};
