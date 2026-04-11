// --- Enums ---
import type { User } from "../../features/auth";

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

// --- Shared Sub-Interfaces ---

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: number;
}

export interface Guardian {
  name: string;
  contact: string;
  relation: string;
}

export interface Section {
  _id: string;
  adviserId: Staff | string; // ID or Populated
  name: string;
  gradeLevel: GradeLevel;
  schoolYear: string;
  currentCapacity: number;
  designatedRoom?: string | Room;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionPayload {
  adviserId: string;
  name: string;
  gradeLevel: GradeLevel;
  schoolYear: string;
  designatedRoom?: string;
}

export type UpdateSectionPayload = Partial<CreateSectionPayload>;

export interface TimeSlot {
  _id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  room: string | Room;
  teacherId?: string; // Added teacherId
  teacher?: Teacher; // Populated teacher
}

export interface Degree {
  field: string;
  institution: string;
  yearCompleted: number;
}

export interface TeacherDetails {
  specializations?: string[];
  masteralDegree?: Degree[];
  doctoralDegree?: Degree[];
}

// --- Domain Interfaces ---
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

export interface Teacher {
  _id: string;
  userId: User | string;
  employeeId: string;
  department: string;
  position: string;
  isActive: boolean;
  profile?: StaffProfile; // Populated
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
  profile?: StaffProfile;
  isActive: boolean;
}

export interface StaffProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address?: Address;
  phoneNumber: string;
  department: string;
  hireDate: string;
  teacherDetails?: TeacherDetails;
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

export interface SubjectSchedule {
  _id: string;
  subject: string | Subject; // ID or Populated
  // teacherId: string; // REMOVED
  // sectionId?: string; // REMOVED
  // section?: Section; // REMOVED
  schoolYear: string;
  semester: Semester;
  schedules: TimeSlot[];
  createdAt: string;
  updatedAt: string;

  // Virtuals populated by backend
  // teacher?: Teacher; // REMOVED (now in TimeSlot)
}

export interface StudentProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: Address;
  guardianDetails: Guardian;
  avatarUrl?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  date: string;
  author: Staff | string;
  category?: string;
}

// --- API Response Interfaces ---

export interface PaginatedResponse {
  totalDocs: number;
  totalPages: number;
  page: number; // Added page
}

export enum SubjectStatus {
  Ongoing = "Ongoing",
  Passed = "Passed",
  Failed = "Failed",
  Dropped = "Dropped",
  Credited = "Credited",
  Withdrawn = "Withdrawn",
}

export enum EnrollmentStatus {
  Enrolled = "Enrolled",
  Passed = "Passed",
  Failed = "Failed",
  Dropped = "Dropped",
  Transferred = "Transferred",
  Graduated = "Graduated",
}

export interface EnrollmentRecord {
  _id: string;
  studentId: string;
  gradeLevel: GradeLevel;
  enrollmentDate: string;
  status: EnrollmentStatus;
  schoolYear: string;
  section?: Section | string;
  semester: Semester;
}

export interface Student {
  _id: string;
  studentId: string;
  course: Course | string;
  userId: string;
  profile?: StudentProfile;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  latestEnrollment?: EnrollmentRecord;
}

export interface SubjectTaken {
  _id: string;
  subject: Subject | string;
  studentId: string;
  scheduleId?: SubjectSchedule | string; // Populated Schedule
  schoolYear: string;
  semester: Semester;

  // Grades
  prelim?: number;
  midterm?: number;
  final?: number;
  finalGrade?: number;
  remarks?: string;
  status: SubjectStatus;

  createdAt?: string;
  updatedAt?: string;

  // Virtuals/Populated
  student?: Student;
}

export enum SchoolYearStatus {
  Active = "Active",
  Closed = "Closed",
  Upcoming = "Upcoming",
}

export interface TermPeriod {
  semester: Semester;
  startDate: string;
  endDate: string;
}

export interface DepartmentPeriods {
  college: TermPeriod[];
  k12: TermPeriod[];
}

export interface SchoolYear {
  _id: string;
  year: string;
  startDate: string;
  endDate: string;
  status: SchoolYearStatus;
  terms: DepartmentPeriods;
  createdAt: string;
  updatedAt: string;
}
