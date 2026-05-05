import { GetAllTeacherAcademicBackgroundFilter } from "../../../domain/interfaces/ITeacherAcademicBackgroundRepository";
import { TeacherAcademicBackgroundNestedResponse } from "../../dto/TeacherAcademicBackgroundResponse";
import { PaginatedResult } from "../../../domain/common/Pagination";

export interface GetAllTeacherAcademicBackgroundRepositoryRequest {
  filter: GetAllTeacherAcademicBackgroundFilter;
  page: number;
  limit: number;
}

export interface IGetAllTeacherAcademicBackgroundUseCase {
  execute(
    request: GetAllTeacherAcademicBackgroundRepositoryRequest
  ): Promise<PaginatedResult<TeacherAcademicBackgroundNestedResponse>>;
}