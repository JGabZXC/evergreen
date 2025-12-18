import { useState, useEffect } from "react";
import {
  getSectionsOption,
  getTeachersOption,
} from "../services/scheduleServices";
import { apiPrivate } from "../../../config/axiosPrivate";
import type {
  SubjectSchedule,
  Subject,
  Teacher,
  Course,
  Section,
} from "../types";

export const useScheduleOptions = (isOpen: boolean) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const controller = new AbortController();
      const fetchData = async () => {
        setLoadingOptions(true);
        try {
          const [secData, teachData, courseRes] = await Promise.all([
            getSectionsOption(controller.signal),
            getTeachersOption(controller.signal),
            apiPrivate.get<{ courses: Course[] }>("/api/course", {
              signal: controller.signal,
            }),
          ]);

          setSections(secData);
          setTeachers(teachData);
          setCourses(courseRes.data.courses || []);

        } catch (error: any) {
          if (error.name !== "CanceledError" && error.name !== "AbortError") {
            console.error("Failed to load dropdown options", error);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoadingOptions(false);
          }
        }
      };
      fetchData();
      return () => controller.abort();
    }
  }, [isOpen]);

  return { sections, teachers, courses, loadingOptions };
};
