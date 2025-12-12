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

export const useSections = (page = 1, limit = 10) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const data = await getAllSections(page, limit, controller.signal);
      setSections(data.sections || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError(
          err.response?.data?.error?.message || "Failed to fetch sections"
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, [page, limit]);

  useEffect(() => {
    const abortFn = fetchSections();
    return () => {
      abortFn.then((abort) => abort && abort());
    };
  }, [fetchSections]);

  return { sections, totalPages, loading, error, refetch: fetchSections };
};

export const useCreateSection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateSectionPayload) => {
    setLoading(true);
    setError(null);
    try {
      await createSection(data);
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to create section"
      );
      return false;
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
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to update section"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};
