export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: number;
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
  dateOfBirth: string;
  phoneNumber: string;
  address: Address;
  guardianDetails: GuardianDetails;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  code: string;
  name: string;
  units: number;
  schedule: string;
  room: string;
}

export interface Adviser {
  name: string;
  email: string;
  department: string;
  avatarUrl: string;
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

export interface TaskItem {
  id: string;
  title: string;
  courseCode: string;
  due: string;
  priority: "high" | "normal";
}

export interface DashboardData {
  profile: StudentProfile;
  enrollment: CourseEnrollment[];
  adviser: Adviser;
  news: NewsItem[];
  events: EventItem[];
  tasks: TaskItem[]; // [NEW] Added tasks array
}
