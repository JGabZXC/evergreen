import { apiPrivate } from "../../../config/axiosPrivate";
import type { StudentAggregate } from "../../dashboard-registrar/types";
import type {PaginatedResponse} from "../../../shared/types";

export interface MyStudentsResponse extends PaginatedResponse {
  students: StudentAggregate[];
}

export const getMyStudents = async (
  schoolYear: string,
  page: number = 1,
  limit: number = 10
): Promise<MyStudentsResponse> => {
  const params: Record<string, string | number> = {
    schoolYear,
    page,
    limit,
  };

  const { data } = await apiPrivate.get("/api/student/my-students", { params });
  return data;
};

