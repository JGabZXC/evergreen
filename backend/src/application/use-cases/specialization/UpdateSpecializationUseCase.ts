import {
  IUpdateSpecializationUseCase,
  UpdateSpecializationRequest,
} from "./IUpdateSpecializationUseCase";
import { ISpecializationRepository } from "../../../domain/interfaces/ISpecializationRepository";
import { SpecializationResponse } from "../../dto/SpecializationResponse";
import { SpecializationMapper } from "../../../infrastructure/mapper/SpecializationMapper";

export class UpdateSpecializationUseCase
  implements IUpdateSpecializationUseCase
{
  constructor(
    public readonly specializationRepository: ISpecializationRepository,
  ) {}

  async execute(
    request: UpdateSpecializationRequest,
  ): Promise<SpecializationResponse> {
    const domainSpecialization = await this.specializationRepository.update(
      request.data,
      request.id,
    );

    return SpecializationMapper.toResponseShallow(domainSpecialization);
  }
}
