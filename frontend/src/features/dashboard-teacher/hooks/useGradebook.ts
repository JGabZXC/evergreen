import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getGrades,
  updateGrade as updateGradeService,
} from "../services/gradeService";
import type { SubjectTaken } from "../types";
import { getCurrentSchoolYear } from "../../../utils/schoolYear";

export const useGradebook = (
  subjectId: string,
  schoolYear: string = getCurrentSchoolYear()
) => {
  const [students, setStudents] = useState<SubjectTaken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGrades(subjectId, schoolYear);
      setStudents(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load grade sheet", err);
      setError("Failed to load grade sheet");
      toast.error("Failed to load grade sheet");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    if (subjectId) {
      fetchGrades();
    }
  }, [subjectId, fetchGrades]);

  const updateGrade = async (
    subjectTakenId: string,
    term: "prelim" | "midterm" | "final",
    grade: number
  ) => {
    try {
      await updateGradeService(subjectTakenId, term, grade);
      toast.success("Grade updated!");
      // Refresh to get calculated final grades
      await fetchGrades();
      return true;
    } catch (err) {
      console.error("Failed to update grade", err);
      toast.error("Failed to update grade");
      return false;
    }
  };

  return {
    students,
    loading,
    error,
    updateGrade,
    refresh: fetchGrades,
  };
};
