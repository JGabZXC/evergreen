import { useState, useEffect, useCallback } from "react";
import { getAllRooms, createRoom, updateRoom } from "../services/roomService";
import type { CreateRoomPayload, UpdateRoomPayload } from "../types";
import type { Room } from "../../../shared/types/index.ts";

export const useRooms = (
  page = 1,
  limit = 10,
  search = "",
  type = "",
  status = ""
) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllRooms(
          page,
          limit,
          search,
          type,
          status,
          signal
        );
        setRooms(data.rooms || []);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(
            err.response?.data?.error?.message || "Failed to fetch rooms"
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [page, limit, search, type, status]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchRooms(controller.signal);
    return () => controller.abort();
  }, [fetchRooms]);

  return { rooms, totalPages, loading, error, refetch: () => fetchRooms() };
};

export const useCreateRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateRoomPayload) => {
    setLoading(true);
    setError(null);
    try {
      await createRoom(data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to create room");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

export const useUpdateRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, data: UpdateRoomPayload) => {
    setLoading(true);
    setError(null);
    try {
      await updateRoom(id, data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to update room");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};
