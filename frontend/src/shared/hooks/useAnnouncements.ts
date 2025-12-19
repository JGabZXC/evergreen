import { useState, useEffect, useCallback } from "react";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type CreateAnnouncementPayload,
  type UpdateAnnouncementPayload,
} from "../services/announcementService";

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  isImportant: boolean;
  authorId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export const useAnnouncements = (
  targetSectionId?: string,
  authorId?: string,
  academicYear?: string,
  semester?: string
) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(
    async (signal?: AbortSignal) => {
      if (!targetSectionId && !authorId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getAnnouncements(
          targetSectionId,
          authorId,
          academicYear,
          semester,
          signal
        );
        setAnnouncements(data);
      } catch (err: any) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(
            err.response?.data?.error?.message ||
              "Failed to fetch announcements"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [targetSectionId, authorId, academicYear, semester]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAnnouncements(controller.signal);
    return () => controller.abort();
  }, [fetchAnnouncements]);

  const addAnnouncement = async (data: CreateAnnouncementPayload) => {
    try {
      await createAnnouncement(data);
      fetchAnnouncements();
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to create announcement"
      );
      return false;
    }
  };

  const editAnnouncement = async (
    id: string,
    data: UpdateAnnouncementPayload
  ) => {
    try {
      await updateAnnouncement(id, data);
      fetchAnnouncements();
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to update announcement"
      );
      return false;
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to delete announcement"
      );
      return false;
    }
  };

  return {
    announcements,
    loading,
    error,
    refetch: fetchAnnouncements,
    addAnnouncement,
    editAnnouncement,
    removeAnnouncement,
  };
};
