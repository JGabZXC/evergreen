import { IUseCase } from "../../../domain/common/IUseCase";
import { PaginatedResult } from "../../../domain/common/Pagination";
import { SpecializationResponse } from "../../dto/SpecializationResponse";
import { GetAllSpecializationFilter } from "../../../domain/interfaces/ISpecializationRepository";

export interface GetAllSpecializationRepositoryRequest {
  filter: GetAllSpecializationFilter;
  page: number;
  limit: number;
}

export type IGetAllSpecializationUseCase = IUseCase<
  GetAllSpecializationRepositoryRequest,
  PaginatedResult<SpecializationResponse>
>;

