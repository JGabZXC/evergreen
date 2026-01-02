import { apiPrivate } from "../../config/axiosPrivate";
import type { SchoolYear } from "../types";

const API_URL = "/api/school-year";

export const schoolYearService = {
  getAll: async () => {
    const response = await apiPrivate.get<SchoolYear[]>(API_URL);
    return response.data;
  },

  create: async (data: Partial<SchoolYear>) => {
    const response = await apiPrivate.post<SchoolYear>(API_URL, data);
    return response.data;
  },

  update: async (id: string, data: Partial<SchoolYear>) => {
    const response = await apiPrivate.patch<SchoolYear>(
      `${API_URL}/${id}`,
      data
    );
    return response.data;
  },
};
