import { apiPrivate } from "../../../config/axiosPrivate";
import type { SubjectTaken } from "../types";

export const getGrades = async (subjectId: string): Promise<SubjectTaken[]> => {
  const { data } = await apiPrivate.get(
    `/api/subject-taken?subject=${subjectId}`
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
