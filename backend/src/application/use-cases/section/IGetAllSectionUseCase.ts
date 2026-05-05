import { GetAllSectionFilter } from "../../../domain/interfaces/ISectionRepository";
import { PaginatedResult } from "../../../domain/common/Pagination";
import {
  SectionNestedResponse,
  SectionResponse,
} from "../../dto/SectionResponse";

export interface GetAllSectionUseCaseRequest {
  filter: GetAllSectionFilter;
  page: number;
  limit: number;
  nested: boolean;
}

export interface IGetAllSectionUseCase {
  execute(
    request: GetAllSectionUseCaseRequest
  ): Promise<PaginatedResult<SectionResponse | SectionNestedResponse>>;
}