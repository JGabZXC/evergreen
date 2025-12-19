import { apiPrivate } from "../../config/axiosPrivate";

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  targetSectionId?: string;
  isImportant: boolean;
  academicYear: string;
  semester: string;
}

export interface UpdateAnnouncementPayload
  extends Partial<CreateAnnouncementPayload> {}

export const getAnnouncements = async (
  targetSectionId?: string,
  authorId?: string,
  academicYear?: string,
  semester?: string,
  signal?: AbortSignal
) => {
  const queryParams = new URLSearchParams();
  if (targetSectionId) queryParams.append("targetSectionId", targetSectionId);
  if (authorId) queryParams.append("authorId", authorId);
  if (academicYear) queryParams.append("academicYear", academicYear);
  if (semester) queryParams.append("semester", semester);

  const response = await apiPrivate.get(
    `/api/announcements?${queryParams.toString()}`,
    { signal }
  );
  return response.data;
};

export const createAnnouncement = async (data: CreateAnnouncementPayload) => {
  const response = await apiPrivate.post("/api/announcements", data);
  return response.data;
};

export const updateAnnouncement = async (
  id: string,
  data: UpdateAnnouncementPayload
) => {
  const response = await apiPrivate.patch(`/api/announcements/${id}`, data);
  return response.data;
};

export const deleteAnnouncement = async (id: string) => {
  const response = await apiPrivate.delete(`/api/announcements/${id}`);
  return response.data;
};
