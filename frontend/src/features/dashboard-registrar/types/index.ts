// --- Types ---
export type Student = {
  id: string;
  name: string;
  program: string;
  yearLevel: string;
  status: "Enrolled" | "Pending" | "Dropped";
  dateEnrolled: string;
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
