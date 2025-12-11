import { useCallback, useEffect, useState } from "react";
import type { Subject, SubjectResponse } from "../types";
import {
  createSubject,
  getAllSubjects,
  updateSubject,
} from "../services/subjectService";
import { toast } from "react-toastify";

export const useSubjects = (
  page = 1,
  limit = 10,
  search = "",
  semesterFilter = "",
  statusFilter = ""
) => {
  const [data, setData] = useState<SubjectResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllSubjects(
        page,
        limit,
        search,
        semesterFilter,
        statusFilter
      );
      setData(result);
    } catch (err: any) {
      console.error("Failed to fetch subjects:", err);

      if (err.response?.data?.error?.message)
        toast.error(err.response.data.error.message);
      else toast.error("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, semesterFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    subjects: data?.subjects || [],
    totalDocs: data?.totalDocs || 0,
    totalPages: data?.totalPages || 0,
    loading,
    refetch: fetchData,
  };
};

export const useCreateSubjects = () => {
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<Subject>) => {
    setLoading(true);
    try {
      await createSubject(data);
      toast.success("Subject created successfully");
    } catch (err: any) {
      console.error("Failed to create subjects:", err);
      if (err.response?.data?.error?.message)
        toast.error(err.response.data.error.message);
      else toast.error("Failed to create subject");
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    loading,
    create,
  };
};

export const useUpdateSubjects = () => {
  const [loading, setLoading] = useState(false);

  const update = useCallback(async (id: string, data: Partial<Subject>) => {
    setLoading(true);
    try {
      await updateSubject(id, data);
      toast.success("Subject updated successfully");
    } catch (err: any) {
      console.error("Failed to update subjects:", err);
      if (err.response?.data?.error?.message)
        toast.error(err.response.data.error.message);
      else toast.error("Failed to update subject");
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    loading,
    update,
  };
};
