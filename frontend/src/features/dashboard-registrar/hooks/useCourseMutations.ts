import { useState } from "react";
import { toast } from "react-toastify";
import { createCourse, updateCourse } from "../services/courseService";
import type { CreateCoursePayload } from "../types";

export const useCourseMutations = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);

  const addCourse = async (data: CreateCoursePayload) => {
    setLoading(true);
    try {
      await createCourse(data);
      toast.success("Course created successfully");
      if (onSuccess) onSuccess();
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
  };

  const editCourse = async (
    code: string,
    data: Partial<CreateCoursePayload>
  ) => {
    setLoading(true);
    try {
      await updateCourse(code, data);
      toast.success("Course updated successfully");
      if (onSuccess) onSuccess();
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
  };

  return {
    addCourse,
    editCourse,
    loading,
  };
};
