import { apiPrivate } from "../../../config/axiosPrivate";

export const getStudents = async (page = 1, limit = 10) => {
  const response = await apiPrivate.get(
    `/api/registrar/students?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getStudent = async (id: string) => {
  const response = await apiPrivate.get(`/api/registrar/students/${id}`);
  return response.data;
};
