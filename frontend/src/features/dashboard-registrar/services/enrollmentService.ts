import { useAxiosPrivate } from "../../auth/hooks/useAxiosPrivate";

export enum GradeLevel {
  Grade1 = "G-1",
  Grade2 = "G-2",
  Grade3 = "G-3",
  Grade4 = "G-4",
  Grade5 = "G-5",
  Grade6 = "G-6",
  Grade7 = "G-7",
  Grade8 = "G-8",
  Grade9 = "G-9",
  Grade10 = "G-10",
  Grade11 = "SHS-11",
  Grade12 = "SHS-12",
  College1 = "COL-1",
  College2 = "COL-2",
  College3 = "COL-3",
  College4 = "COL-4",
  College5 = "COL-5",
  College6 = "COL-6",
}

export enum Semester {
  First = 1,
  Second = 2,
  Third = 3,
}

export interface CreditPayload {
  studentId: string;
  subjectId: string;
  previousSchool: string;
  finalGrade: number;
}

export interface EnrollPayload {
  studentId: string;
  gradeLevel: GradeLevel; // Accepts "G-1", "SHS-11" etc.
  schoolYear: string; // e.g., "2024-2025"
  semester: Semester; // 1, 2, or 3
  classroom?: string; // Optional manual section assignment
}

export interface Subject {
  _id: string;
  subjectId: string;
  description?: string;
  targetGradeLevels: GradeLevel[];
  semesterAvailable: Semester[];
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SubjectResponse {
  totalDocs: number;
  totalPages: number;
  subjects: Subject[];
}

export const creditStudentSubjects = async (payloads: CreditPayload[]) => {
  const apiPrivate = useAxiosPrivate();
  const response = await apiPrivate.post("/api/registrar/credit-subjects", {
    credits: payloads,
  });
  return response.data;
};

export const enrollStudent = async (payload: EnrollPayload) => {
  const apiPrivate = useAxiosPrivate();
  const response = await apiPrivate.post("/api/registrar/enroll", payload);
  return response.data;
};

export const getAllSubjects = async () => {
  const apiPrivate = useAxiosPrivate();
  const response = await apiPrivate.get<SubjectResponse>("/api/subject/");
  return response.data;
};
