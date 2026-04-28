import {
  GetAllSectionUseCaseRequest,
  IGetAllSectionUseCase,
} from "./IGetAllSectionUseCase";
import { ISectionRepository } from "../../../domain/interfaces/ISectionRepository";
import { PaginatedResult } from "../../../domain/common/Pagination";
import {
  SectionNestedResponse,
  SectionResponse,
} from "../../dto/SectionResponse";
import { SectionMapper } from "../../../infrastructure/mapper/SectionMapper";

export class GetAllSectionUseCase implements IGetAllSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(
    request: GetAllSectionUseCaseRequest,
  ): Promise<PaginatedResult<SectionResponse | SectionNestedResponse>> {
    const result = await this.sectionRepository.getAll(
      request.filter,
      request.page,
      request.limit,
      request.nested,
    );

    const data = request.nested
      ? result.data.map(SectionMapper.toResponseDeep)
      : result.data.map(SectionMapper.toResponseShallow);

    return {
      data,
      meta: result.meta,
    };
  }
}

