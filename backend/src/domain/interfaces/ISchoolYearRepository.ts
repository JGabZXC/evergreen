import { PaginatedResult } from "../common/Pagination";
import { SchoolYear } from "../entities/SchoolYear";
import { SchoolYearStatusHistory } from "../entities/SchoolYearStatusHistory";
import { SchoolYearStatus } from "../../generated/prisma/enums";

export interface GetAllSchoolYearFilter {
  status?: SchoolYearStatus;
  changedById?: string;
}

export interface CreateSchoolYearRepositoryRequest {
  startDate: Date;
  endDate: Date;
  gracePeriod: number;
  status: SchoolYearStatus;
  createdById: string | null;
}

export interface UpdateSchoolYearRepositoryRequest {
  startDate?: Date;
  endDate?: Date;
  gracePeriod?: number;
  status?: SchoolYearStatus;
}

export interface CreateSchoolYearStatusHistoryRequest {
  schoolYearId: string;
  previousStatus: SchoolYearStatus;
  newStatus: SchoolYearStatus;
  remarks?: string | null;
  changedById?: string | null;
}

export interface ISchoolYearRepository {
  getAll(
    filter: GetAllSchoolYearFilter,
    page: number,
    limit: number,
    nested: boolean,
  ): Promise<PaginatedResult<SchoolYear>>;

  findById(id: string, nested?: boolean): Promise<SchoolYear | null>;

  create(data: CreateSchoolYearRepositoryRequest): Promise<SchoolYear>;

  update(
    data: UpdateSchoolYearRepositoryRequest,
    schoolYearId: string,
  ): Promise<boolean>;

  delete(schoolYearId: string): Promise<boolean>;

  createStatusHistory(
    data: CreateSchoolYearStatusHistoryRequest,
  ): Promise<SchoolYearStatusHistory>;
}
