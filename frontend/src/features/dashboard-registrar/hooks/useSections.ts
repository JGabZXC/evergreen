import { useState, useEffect, useCallback } from "react";
import {
  getAllSections,
  createSection,
  updateSection,
} from "../services/sectionService";
import type {
  Section,
  CreateSectionPayload,
  UpdateSectionPayload,
} from "../types";

export const useSections = (
  page = 1,
  limit = 10,
  search = "",
  gradeLevel = "",
  schoolYear = "",
  capacity = ""
) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllSections(
          page,
          limit,
          search,
          gradeLevel,
          schoolYear,
          capacity,
          signal
        );

        setSections(data.sections || []);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(
            err.response?.data?.error?.message || "Failed to fetch sections"
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [page, limit, search, gradeLevel, schoolYear, capacity]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSections(controller.signal);
    return () => controller.abort();
  }, [fetchSections]);

  return {
    sections,
    totalPages,
    loading,
    error,
    refetch: () => fetchSections(),
  };
};

export const useCreateSection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateSectionPayload) => {
    setLoading(true);
    setError(null);
    try {
      await createSection(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to create section"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

export const useUpdateSection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, data: UpdateSectionPayload) => {
    setLoading(true);
    setError(null);
    try {
      await updateSection(id, data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to update section"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};
