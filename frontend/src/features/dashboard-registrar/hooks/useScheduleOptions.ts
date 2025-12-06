import { useState, useEffect } from "react";
import {
  getSectionsOption,
  getSubjectsOption,
  getTeachersOption,
} from "../services/scheduleServices";
import { apiPrivate } from "../../../config/axiosPrivate";
import type {
  SectionOption,
  SubjectOption,
  TeacherOption,
  CourseOption,
} from "../types";

export const useScheduleOptions = (isOpen: boolean) => {
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingOptions(true);
        try {
          const [secData, subData, teachData, courseRes] = await Promise.all([
            getSectionsOption(),
            getSubjectsOption(),
            getTeachersOption(),
            apiPrivate.get("/api/registrar/course"),
          ]);

          setSections(secData);
          setSubjects(subData);
          setTeachers(teachData);
          setCourses(courseRes.data.courses || []);
        } catch (error) {
          console.error("Failed to load dropdown options", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  return { sections, subjects, teachers, courses, loadingOptions };
};
