import { apiPrivate } from "../../../config/axiosPrivate";
import type { CreateRoomPayload, UpdateRoomPayload } from "../types";

export const getAllRooms = async (
  page = 1,
  limit = 10,
  search = "",
  type = "",
  status = "",
  signal?: AbortSignal
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append("search", search);
  if (type && type !== "ALL") queryParams.append("type", type);
  if (status && status !== "ALL") queryParams.append("status", status);

  const response = await apiPrivate.get(`/api/room?${queryParams.toString()}`, {
    signal,
  });
  return response.data;
};

export const createRoom = async (roomData: CreateRoomPayload) => {
  const response = await apiPrivate.post("/api/room", roomData);
  return response.data;
};

export const updateRoom = async (id: string, roomData: UpdateRoomPayload) => {
  const response = await apiPrivate.patch(`/api/room/${id}`, roomData);
  return response.data;
};
