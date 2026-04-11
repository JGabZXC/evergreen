import { UserResponse } from "./UserResponse";

export interface SchoolYearStatusHistoryResponse {
  id: string;
  schoolYearId: string;
  previousStatus: string;
  newStatus: string;
  remarks: string | null;
  changedById: string | null;
  changedAt: string;

  // NESTED PROPERTIES
  changedBy: UserResponse | null;
}

export interface SchoolYearResponse {
  id: string;
  startDate: string;
  endDate: string;
  gracePeriod: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolYearNestedResponse extends SchoolYearResponse {
  createdBy: UserResponse | null;
  schoolYearStatusHistory: SchoolYearStatusHistoryResponse[] | null;
}
