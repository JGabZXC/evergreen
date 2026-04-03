import {
  IGetAllSpecializationUseCase,
  GetAllSpecializationRepositoryRequest,
} from "./IGetAllSpecializationUseCase";
import { ISpecializationRepository } from "../../../domain/interfaces/ISpecializationRepository";
import { PaginatedResult } from "../../../domain/common/Pagination";
import { SpecializationResponse } from "../../dto/SpecializationResponse";
import { SpecializationMapper } from "../../../infrastructure/mapper/SpecializationMapper";

export class GetAllSpecializationUseCase
  implements IGetAllSpecializationUseCase
{
  constructor(
    public readonly specializationRepository: ISpecializationRepository,
  ) {}

  async execute(
    request: GetAllSpecializationRepositoryRequest,
  ): Promise<PaginatedResult<SpecializationResponse>> {
    const filter = request.filter ?? {};
    const page = Number.isNaN(Number(request.page))
      ? 1
      : Math.max(1, Number(request.page));
    const limit = Number.isNaN(Number(request.limit))
      ? 10
      : Math.max(1, Number(request.limit));

    const result = await this.specializationRepository.getAll(
      filter,
      page,
      limit,
    );

    const data = result.data.map(SpecializationMapper.toResponseShallow);

    return {
      data,
      meta: result.meta,
    };
  }
}
