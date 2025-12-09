import { apiPrivate } from "../../../config/axiosPrivate";
import type { CreditPayload, EnrollPayload, SubjectResponse } from "../types";
export const creditStudentSubjects = async (payloads: CreditPayload[]) => {
  const response = await apiPrivate.post("/api/registrar/credit-subjects", {
    credits: payloads,
  });
  return response.data;
};

export const enrollStudent = async (payload: EnrollPayload) => {
  const response = await apiPrivate.post("/api/registrar/enroll", payload);
  return response.data;
};

export const getAllSubjects = async () => {
  const response = await apiPrivate.get<SubjectResponse>("/api/subject/");
  return response.data;
};
