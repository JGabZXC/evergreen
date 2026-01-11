import type {
  SubjectTaken,
} from "../../../shared/types";

export type { SubjectTaken }; // Re-export for local usage if needed

export interface TeacherProfile {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  avatarUrl: string;
}

export interface TaskItem {
  id: string;
  title: string;
  deadline: string;
  priority: "high" | "normal";
  type: "grading" | "admin";
}