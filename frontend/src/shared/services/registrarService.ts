import { apiPrivate } from "../../config/axiosPrivate";
import type { RegistrarAdminListResponse } from "../../features/dashboard/types/registrar.types";

// Note: the backend endpoint is /api/users/ and supports filters id, email, role, isActive
export const getUsers = async (query?: {
  id?: string | number;
  email?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const params: Record<string, string | number | boolean> = {};
  if (query?.id) params.id = String(query.id);
  if (query?.email) params.email = String(query.email);
  if (query?.role) params.role = String(query.role);
  if (typeof query?.isActive !== "undefined") params.isActive = query.isActive;

  params.page = query?.page ?? 1;
  params.limit = query?.limit ?? 10;

  const response = await apiPrivate.get<RegistrarAdminListResponse>(`/api/users/`, { params });
  return response.data;
};

export const createUser = async (payload: unknown) => {
  // If dateOfBirth is a Date object, convert to ISO string for the API
  try {
    const body: any = { ...(payload as any) };
    if (body?.userProfile?.dateOfBirth instanceof Date) {
      body.userProfile.dateOfBirth = body.userProfile.dateOfBirth.toISOString();
    }

    const response = await apiPrivate.post(`/api/users/`, body);
    return response.data;
  } catch (err) {
    throw err;
  }
};





