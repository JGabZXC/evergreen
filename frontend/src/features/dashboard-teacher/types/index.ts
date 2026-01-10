import type {
  SubjectTaken,
} from "../../../shared/types";

export type { SubjectTaken }; // Re-export for local usage if needed

// --- Enums ---
// SubjectStatus moved to shared

// --- Domain Interfaces ---
// Student moved to shared

// SubjectTaken moved to shared

// --- OLD ---
export interface TeacherProfile {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  avatarUrl: string;
}

export interface TeachingLoad {
  code: string;
  name: string;
  schedule: string;
  room: string;
  enrolled: number;
}

export interface QuickStat {
  label: string;
  value: string;
  icon: "students" | "classes" | "pending";
  trend?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  deadline: string;
  priority: "high" | "normal";
  type: "grading" | "admin";
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  type: "academic" | "extra";
}

export interface TeacherDashboardData {
  profile: TeacherProfile;
  stats: QuickStat[];
  load: TeachingLoad[];
  tasks: TaskItem[];
  news: NewsItem[];
  events: EventItem[];
}
