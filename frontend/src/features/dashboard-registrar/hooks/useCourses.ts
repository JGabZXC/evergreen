import { useCallback, useEffect, useState } from "react";
import type { Course, CreateCoursePayload } from "../types";
import {
  getAllCourses,
  createCourse,
  updateCourse,
} from "../services/courseService";
import { toast } from "react-toastify";

export const useCourses = (
  page = 1,
  limit = 10,
  search = "",
  gradeAvailable = ""
) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      setLoading(true);
      setError(null);

      const result = await getAllCourses(
        page,
        limit,
        search,
        gradeAvailable,
        signal
      );
      setCourses(result.courses);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        console.log("Request aborted");
        return;
      }
      console.error("Failed to fetch courses:", err);
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError("Failed to fetch courses");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, [page, limit, search, gradeAvailable]);

  useEffect(() => {
    const abortFn = fetchData();
    return () => {
      abortFn.then((fn) => fn && fn());
    };
  }, [fetchData]);

  return {
    courses,
    totalPages,
    loading,
    error,
    refetch: fetchData,
  };
};

export const useCreateCourse = () => {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: CreateCoursePayload) => {
    setLoading(true);
    try {
      await createCourse(data);
      toast.success("Course created successfully");
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.error?.message || "Failed to create course"
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    create,
  };
};

export const useUpdateCourse = () => {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (code: string, data: Partial<CreateCoursePayload>) => {
      setLoading(true);
      try {
        await updateCourse(code, data);
        toast.success("Course updated successfully");
        return true;
      } catch (error: any) {
        console.error(error);
        toast.error(
          error.response?.data?.error?.message || "Failed to update course"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    update,
  };
};
