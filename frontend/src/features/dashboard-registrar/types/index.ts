// frontend/src/features/dashboard-registrar/types/index.ts

// --- Enums ---

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

// --- Domain Interfaces ---

export interface Course {
  _id: string;
  code: string;
  name: string;
  gradeAvailable: "shs" | "college";
  // Add other fields if needed
}

export interface Address {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface GuardianDetails {
  name: string;
  contact: string;
  relation: string;
}

export interface StudentProfile {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO Date
  phoneNumber?: string;
  address?: Address;
  guardianDetails?: GuardianDetails;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentRecord {
  _id: string;
  studentId: string;
  schoolYear: string;
  semester: number;
  gradeLevel: string;
  status: string; // e.g., "Enrolled", "Dropped"
  enrollmentDate: string;
  // Add other fields if needed
}

export interface Student {
  _id: string;
  userId: string;
  studentId: string;
  formattedId: string;
  isActive: boolean;
  course: Course; // Populated
  profile?: StudentProfile;
  latestEnrollment?: EnrollmentRecord;
}

export interface Subject {
  _id: string;
  name: string;
  subjectId: string;
  description?: string;
  targetGradeLevels: GradeLevel[];
  semesterAvailable: Semester[];
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Classroom {
  _id: string;
  adviserId: string;
  name: string; // Section name
  gradeLevel: GradeLevel;
  capacity: number;
  currentCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  _id?: string;
}

export interface ClassSchedule {
  _id: string;
  classroomId:
    | {
        _id: string;
        name: string;
        gradeLevel: string;
      }
    | string; // Can be populated or ID
  subjectId:
    | {
        _id: string;
        name: string;
        subjectId: string;
      }
    | string; // Can be populated or ID
  teacherId:
    | {
        _id: string;
        employeeId: string;
        userId: {
          email: string;
          // other user fields
        };
      }
    | string; // Can be populated or ID
  schoolYear: string;
  semester: number;
  schedules: TimeSlot[];
}

export interface Teacher {
  userId: {
    _id: string;
    email: string;
    role: string;
  };
  employeeId: string;
  isActive: boolean;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

// --- API Response Interfaces ---

export interface PaginatedResponse {
  totalDocs: number;
  totalPages: number;
}

export interface SubjectResponse extends PaginatedResponse {
  subjects: Subject[];
}

export interface StudentResponse extends PaginatedResponse {
  students: Student[];
}

export interface ScheduleResponse extends PaginatedResponse {
  schedules: ClassSchedule[];
}

export interface ClassroomResponse extends PaginatedResponse {
  classrooms: Classroom[];
}

export interface TeacherResponse extends PaginatedResponse {
  teachers: Teacher[];
}

// --- Payload Interfaces ---

export interface CreditPayload {
  studentId: string;
  subjectId: string;
  previousSchool: string;
  finalGrade: number;
}

export interface EnrollPayload {
  studentId: string;
  gradeLevel: GradeLevel;
  schoolYear: string;
  semester: Semester;
  classroom?: string;
}

// --- Option Interfaces (for Dropdowns) ---

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
}

// --- Component Specific Types ---

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
  schedules: ScheduleSlot[];
}
