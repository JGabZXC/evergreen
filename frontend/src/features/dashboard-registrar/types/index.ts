// frontend/src/features/dashboard-registrar/types/index.ts

import type { StudentProfile } from "../../dashboard-student/types";

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  _id?: string;
}

// Matching the populated backend response
export interface ClassSchedule {
  _id: string;
  classroomId: {
    _id: string;
    name: string;
    gradeLevel: string;
  };
  subjectId: string;
  subject?: {
    // Populated virtual
    name: string;
    subjectId: string;
  };
  teacherId: string;
  teacher?: {
    // Populated virtual
    userId: {
      email: string;
    };
    employeeId: string;
  };
  schoolYear: string;
  semester: number;
  schedules: TimeSlot[];
}

export interface ScheduleResponse {
  totalDocs: number;
  totalPages: number;
  schedules: ClassSchedule[];
}

export interface EnrollmentHistory {
  _id: string;
  schoolYear: string;
  semester: number;
  gradeLevel: string;
  status: string;
  enrollmentDate: string;
}

// --- Types ---
export type Student = {
  id: string; // This is the studentId string (e.g. 2024-001)
  _id: string; // Mongo ID
  name: string;
  program: string;
  yearLevel: string; // Derived from latest enrollment
  status: "Enrolled" | "Dropped" | "Inactive";
  dateEnrolled: string;

  // New Fields from Backend
  profile?: StudentProfile;
  latestEnrollment?: EnrollmentHistory;
};

export type ScheduleItem = {
  id: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string | null;
  timeSlot: string;
  room: string;
};

export type Teacher = {
  id: string;
  name: string;
  department: string;
};

// --- Options Types ---
export interface SectionOption {
  _id: string;
  name: string;
  gradeLevel: string;
}

export interface SubjectOption {
  _id: string;
  subjectId: string;
  name: string;
}

export interface TeacherOption {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  userId?: {
    email: string;
  };
}

export interface CourseOption {
  _id: string;
  code: string;
  name: string;
  subjectToBeTaken: {
    subject: (string | { _id: string })[];
  }[];
}

// --- Payload Types ---
export interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface ScheduleSlotWithId extends ScheduleSlot {
  id: string;
}

export interface CreateSchedulePayload {
  classroomId: string;
  subjectId: string;
  teacherId: string;
  schoolYear: string;
  semester: number;
  schedules: Omit<ScheduleSlot, "id">[];
}
