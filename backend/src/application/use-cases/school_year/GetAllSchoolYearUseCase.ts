import {
  GetAllSchoolYearRepositoryRequest,
  IGetAllSchoolYearUseCase,
} from "./IGetAllSchoolYearUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";
import { PaginatedResult } from "../../../domain/common/Pagination";
import {
  SchoolYearNestedResponse,
  SchoolYearResponse,
} from "../../dto/SchoolYearResponse";
import { SchoolYearMapper } from "../../../infrastructure/mapper/SchoolYearMapper";

export class GetAllSchoolYearUseCase implements IGetAllSchoolYearUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(
    request: GetAllSchoolYearRepositoryRequest,
  ): Promise<PaginatedResult<SchoolYearResponse | SchoolYearNestedResponse>> {
    const filter = request.filter ?? {};
    const page = Number.isNaN(Number(request.page))
      ? 1
      : Math.max(1, Number(request.page));
    const limit = Number.isNaN(Number(request.limit))
      ? 10
      : Math.max(1, Number(request.limit));
    const nested = Boolean(request.nested);

    const result = await this.schoolYearRepository.getAll(
      filter,
      page,
      limit,
      nested,
    );

    const data = nested
      ? result.data.map(SchoolYearMapper.toResponseDeep)
      : result.data.map(SchoolYearMapper.toResponseShallow);

    return {
      data,
      meta: result.meta,
    };
  }
}
