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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllCourses(page, limit, search, gradeAvailable);
      setCourses(result.courses);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch courses:", err);
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError("Failed to fetch courses");
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, gradeAvailable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCourse = async (data: CreateCoursePayload) => {
    setSubmitting(true);
    try {
      await createCourse(data);
      toast.success("Course created successfully");
      fetchData(); // Refresh list
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.error?.message || "Failed to create course"
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const editCourse = async (
    code: string,
    data: Partial<CreateCoursePayload>
  ) => {
    setSubmitting(true);
    try {
      await updateCourse(code, data);
      toast.success("Course updated successfully");
      fetchData(); // Refresh list
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.error?.message || "Failed to update course"
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    courses,
    totalPages,
    loading,
    submitting,
    error,
    refetch: fetchData,
    addCourse,
    editCourse,
  };
};
