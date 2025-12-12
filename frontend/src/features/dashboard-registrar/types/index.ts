// --- Enums  ---

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

// --- Shared Sub-Interfaces ---

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Guardian {
  name: string;
  relationship: string;
  contactNumber: string;
}

// --- Domain Interfaces ---

export interface CurriculumItem {
  _id: string;
  semester: Semester;
  gradeLevel: GradeLevel;
  subject: Subject[];
}

export interface Course {
  _id: string;
  code: string;
  name: string;
  gradeAvailable: "shs" | "college";
  curriculum: CurriculumItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  email: string;
  phoneNumber: string;
  address: Address;
  guardian: Guardian;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentRecord {
  _id: string;
  studentId: string;
  schoolYear: string;
  semester: Semester;
  gradeLevel: GradeLevel;
  status: string; // e.g., "Enrolled", "Dropped"
  enrollmentDate: string;
  classroomId?: string; // ID Reference
}

// Matches the aggregation result from GetAllStudentUseCase
export interface Student {
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

export interface Staff {
  _id: string;
  userId: {
    _id: string;
    email: string;
    username: string;
    role: string;
  };
  employeeId: string;
  isActive: boolean;
}

export interface Subject {
  _id: string;
  name: string; // e.g. "Calculus I" (This is essentially the 'description')
  subjectId: string; // e.g. "MATH101" (This is essentially the 'code')
  description?: string;
  // targetGradeLevels: GradeLevel[]; // REMOVED
  semesterAvailable: Semester[];
  active: boolean;
  createdBy: string;
  // createdAt: string;
  // updatedAt: string;
}

export interface Classroom {
  _id: string;
  name: string; // Section Name
  gradeLevel: GradeLevel;
  capacity: number;
  currentCapacity: number;
  adviserId?: string; // Teacher ID
  createdAt: string;
  updatedAt: string;
}

// --- Schedule Interfaces ---

export interface TimeSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  room: string;
  _id?: string;
}

export interface ClassSchedule {
  _id: string;
  classroomId: string | Classroom; // ID or Populated
  subject: string | Subject; // ID or Populated
  teacherId: string; // ID or Populated
  schoolYear: string;
  semester: Semester;
  schedules: TimeSlot[];
  createdAt: string;
  updatedAt: string;

  // Virtuals populated by backend
  teacher?: Teacher;
}

// --- Staff/Teacher Interfaces ---

export interface StaffProfile {
  employeeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address?: Address;
  phoneNumber: string;
  department: string;
  hireDate: string;

  // VIRTUALS
  staff?: Staff;
}

export interface Teacher {
  _id: string;
  userId: {
    _id: string;
    email: string;
    username: string;
    role: string;
  };
  employeeId: string;
  department: string;
  position: string;
  isActive: boolean;
  profile?: StaffProfile; // Populated
}

// --- API Response Interfaces ---

export interface PaginatedResponse {
  totalDocs: number;
  totalPages: number;
  page: number; // Added page
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

export interface CourseResponse extends PaginatedResponse {
  courses: Course[];
}

// --- Payload Interfaces (Requests) ---

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
  classroom?: string; // Optional Section ID override
}

export interface CreateSchedulePayload {
  classroomId: string;
  subjectId: string;
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
export enum RoomType {
  Lecture = "Lecture",
  Laboratory = "Laboratory",
  ComputerLab = "Computer Lab",
  Gymnasium = "Gymnasium",
}

export enum RoomStatus {
  Open = "Open",
  UnderMaintenance = "Under Maintenance",
}

export interface Room {
  _id: string;
  name: string;
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomPayload {
  name: string;
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  isActive: boolean;
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {}

// --- Section Types ---
export interface Section {
  _id: string;
  adviserId: string;
  name: string;
  gradeLevel: GradeLevel;
  schoolYear: string;
  capacity: number;
  currentCapacity: number;
  designatedRoom?: string; // Room ID
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionPayload {
  adviserId: string;
  name: string;
  gradeLevel: GradeLevel;
  schoolYear: string;
  capacity: number;
  designatedRoom?: string;
}

export interface UpdateSectionPayload extends Partial<CreateSectionPayload> {}
