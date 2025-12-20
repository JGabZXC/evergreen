import type {
  Course,
  Room,
  Semester,
  Subject,
  Teacher,
} from "../../../shared/types/index.ts";
import type { StudentProfile } from "../../dashboard-student/types/index.ts";

// --- Enums ---
export enum SubjectStatus {
  Ongoing = "Ongoing",
  Passed = "Passed",
  Failed = "Failed",
  Dropped = "Dropped",
  Credited = "Credited",
  Withdrawn = "Withdrawn",
}

// --- Domain Interfaces ---
export interface Student {
  _id: string;
  studentId: string;
  course: Course | string;
  userId: string;
  profile?: StudentProfile;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface SubjectTaken {
  _id: string;
  subject: Subject;
  teacherId: string; // "TBA" or ObjectId
  studentId: string;
  classroomId: Room; // Room
  schoolYear: string;
  semester: Semester;

  // Grades
  prelim?: number;
  midterm?: number;
  final: number;
  finalGrade: number;
  remarks?: string;
  status: SubjectStatus;

  createdAt: string;
  updatedAt: string;

  // VIRTUALS
  teacher?: Teacher;
  student?: Student;
}

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
