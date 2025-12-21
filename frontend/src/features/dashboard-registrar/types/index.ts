import type {
  Course,
  CurriculumItem,
  GradeLevel,
  PaginatedResponse,
  Room,
  RoomStatus,
  RoomType,
  Section,
  Semester,
  Staff,
  StudentProfile,
  Subject,
  SubjectSchedule,
  Teacher,
  TimeSlot,
} from "../../../shared/types/index.ts";

// --- Domain Interfaces ---

export interface EnrollmentRecord {
  _id: string;
  studentId: string;
  schoolYear: string;
  semester: Semester;
  gradeLevel: GradeLevel;
  status: string; // e.g., "Enrolled", "Dropped"
  enrollmentDate: string;
  section?: string | Section; // ID Reference
}

// Matches the aggregation result from GetAllStudentUseCase
export interface StudentAggregate {
  _id: string;
  userId: string;
  studentId: string;
  isActive: boolean;

  // Populated Fields via Aggregation
  course?: Course;
  profile?: StudentProfile;
  latestEnrollment?: EnrollmentRecord;

  createdAt: string;
  updatedAt: string;
}

// --- API Response Interfaces ---

export interface SubjectResponse extends PaginatedResponse {
  subjects: Subject[];
}

export interface StudentResponse extends PaginatedResponse {
  students: StudentAggregate[];
}

export interface ScheduleResponse extends PaginatedResponse {
  schedules: SubjectSchedule[];
}

export interface RoomResponse extends PaginatedResponse {
  rooms: Room[];
}

export interface TeacherResponse extends PaginatedResponse {
  teachers: Teacher[];
}

export interface CourseResponse extends PaginatedResponse {
  courses: Course[];
}

export interface SectionResponse extends PaginatedResponse {
  sections: Section[];
}

// --- Payload Interfaces (Requests) ---

export interface CreditPayload {
  studentId: string;
  subject: string;
  previousSchool: string;
  finalGrade: number;
}

export interface EnrollPayload {
  studentId: string;
  gradeLevel: GradeLevel;
  schoolYear: string;
  semester: Semester;
  classroom?: string; // Optional Section ID override
}

export interface CreateSchedulePayload {
  subject: string;
  teacherId: string; // "TBA" or Employee ID
  schoolYear: string;
  semester: Semester;
  schedules: Omit<TimeSlot, "_id">[];
}

export interface CreateCoursePayload {
  name: string;
  code: string;
  gradeAvailable: "shs" | "college";
  curriculum: (Omit<CurriculumItem, "_id" | "subject"> & {
    subject: Subject["_id"][];
  })[];
}

// --- Option Interfaces (UI Helpers) ---

export interface SectionOption {
  _id: string;
  name: string;
  gradeLevel: string;
}

export interface SubjectOption {
  _id: string;
  subjectId: string;
  description: string; // Use description for display name
}

export interface TeacherOption {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

// --- Room Types ---

export interface CreateRoomPayload {
  name: string;
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  isActive: boolean;
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {}
