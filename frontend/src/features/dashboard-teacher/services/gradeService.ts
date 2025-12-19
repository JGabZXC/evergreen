import { apiPrivate } from "../../../config/axiosPrivate";
import type { SubjectTaken } from "../types";
import { Semester } from "../../../shared/types/index.ts";

export const getGrades = async (
  subjectId: string,
  schoolYear: string,
  semester: Semester
): Promise<SubjectTaken[]> => {
  const { data } = await apiPrivate.get(
    `/api/subject-taken?subject=${subjectId}&schoolYear=${schoolYear}&semester=${semester}`
  );
  return data.subjectTakens;
};

export const updateGrade = async (
  subjectTakenId: string,
  term: "prelim" | "midterm" | "final",
  grade: number
): Promise<SubjectTaken> => {
  const { data } = await apiPrivate.patch("/api/teacher/grade", {
    subjectTakenId,
    term,
    grade,
  });
  return data;
};
