import { GetAllSectionFilter } from "../../../domain/interfaces/ISectionRepository";
import { IUseCase } from "../../../domain/common/IUseCase";
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

export type IGetAllSectionUseCase = IUseCase<
  GetAllSectionUseCaseRequest,
  PaginatedResult<SectionResponse | SectionNestedResponse>
>;

