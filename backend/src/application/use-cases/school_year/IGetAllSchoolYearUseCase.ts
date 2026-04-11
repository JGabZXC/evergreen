import { IUseCase } from "../../../domain/common/IUseCase";
import { PaginatedResult } from "../../../domain/common/Pagination";
import { GetAllSchoolYearFilter } from "../../../domain/interfaces/ISchoolYearRepository";
import {
  SchoolYearNestedResponse,
  SchoolYearResponse,
} from "../../dto/SchoolYearResponse";

export interface GetAllSchoolYearRepositoryRequest {
  filter: GetAllSchoolYearFilter;
  page: number;
  limit: number;
  nested: boolean;
}

export type IGetAllSchoolYearUseCase = IUseCase<
  GetAllSchoolYearRepositoryRequest,
  PaginatedResult<SchoolYearResponse | SchoolYearNestedResponse>
>;
