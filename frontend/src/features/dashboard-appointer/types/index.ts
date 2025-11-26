type UserRole = "Admin" | "Teacher" | "Staff";

export type StaffMember = {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  dateAppointed: string;
  status: "Active" | "On Leave" | "Terminated";
};
