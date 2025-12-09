import { useState, useEffect } from "react";
import {
  getSectionsOption,
  getSubjectsOption,
  getTeachersOption,
} from "../services/scheduleServices";
import { apiPrivate } from "../../../config/axiosPrivate";
import type { Classroom, Subject, Teacher, Course } from "../types";

export const useScheduleOptions = (isOpen: boolean) => {
  const [sections, setSections] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
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
            apiPrivate.get<{ courses: Course[] }>("/api/registrar/course"),
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
