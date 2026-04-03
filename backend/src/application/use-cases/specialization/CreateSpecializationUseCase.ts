import {
  ICreateSpecializationUseCase,
  CreateSpecializationRequest,
} from "./ICreateSpecializationUseCase";
import { ISpecializationRepository } from "../../../domain/interfaces/ISpecializationRepository";
import { SpecializationResponse } from "../../dto/SpecializationResponse";
import { SpecializationMapper } from "../../../infrastructure/mapper/SpecializationMapper";

export class CreateSpecializationUseCase
  implements ICreateSpecializationUseCase
{
  constructor(
    public readonly specializationRepository: ISpecializationRepository,
  ) {}

  async execute(
    request: CreateSpecializationRequest,
  ): Promise<SpecializationResponse> {
    const domainSpecialization = await this.specializationRepository.create(
      request.data,
      request.creatorId,
    );

    return SpecializationMapper.toResponseShallow(domainSpecialization);
  }
}
