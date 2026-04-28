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
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  gracePeriod?: number | undefined;
  status?: SchoolYearStatus | undefined;
}

export interface CreateSchoolYearStatusHistoryRequest {
  schoolYearId: string;
  previousStatus: SchoolYearStatus;
  newStatus: SchoolYearStatus;
  remarks?: string | undefined;
  changedById?: string | undefined;
}

export interface ISchoolYearRepository {
  getAll(
    filter: GetAllSchoolYearFilter,
    page: number,
    limit: number,
    nested: boolean,
  ): Promise<PaginatedResult<SchoolYear>>;

  findById(id: string, nested?: boolean): Promise<SchoolYear | null>;

  findOverlapping(
    startDate: Date,
    endDate: Date,
    excludeSchoolYearId?: string,
  ): Promise<SchoolYear | null>;

  create(data: CreateSchoolYearRepositoryRequest): Promise<SchoolYear>;

  update(
    data: UpdateSchoolYearRepositoryRequest & {
      remarks?: string | undefined;
      changedById?: string | undefined;
    },
    schoolYearId: string,
  ): Promise<boolean>;

  delete(schoolYearId: string): Promise<boolean>;

  createStatusHistory(
    data: CreateSchoolYearStatusHistoryRequest,
  ): Promise<SchoolYearStatusHistory>;
}
