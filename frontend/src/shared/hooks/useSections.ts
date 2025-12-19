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
  capacity = "",
  adviserId = ""
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
          adviserId,
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
        setLoading(false);
      }
    },
    [page, limit, search, gradeLevel, schoolYear, capacity, adviserId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSections(controller.signal);
    return () => controller.abort();
  }, [fetchSections]);

  const addSection = async (sectionData: CreateSectionPayload) => {
    try {
      await createSection(sectionData);
      fetchSections();
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to create section"
      );
      return false;
    }
  };

  const editSection = async (id: string, sectionData: UpdateSectionPayload) => {
    try {
      await updateSection(id, sectionData);
      fetchSections();
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to update section"
      );
      return false;
    }
  };

  return {
    sections,
    totalPages,
    loading,
    error,
    refetch: fetchSections,
    addSection,
    editSection,
  };
};
