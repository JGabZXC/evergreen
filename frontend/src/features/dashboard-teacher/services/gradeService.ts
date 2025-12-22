import { apiPrivate } from "../../../config/axiosPrivate";
import { Semester, type SubjectTaken } from "../../../shared/types/index.ts";

export const getGrades = async (
  subjectId: string,
  scheduleId: string | undefined,
  schoolYear: string,
  semester: Semester
): Promise<SubjectTaken[]> => {
  let url = `/api/subject-taken?subject=${subjectId}&schoolYear=${schoolYear}&semester=${semester}`;
  if (scheduleId) {
    url += `&scheduleId=${scheduleId}`;
  }
  const { data } = await apiPrivate.get(url);
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
