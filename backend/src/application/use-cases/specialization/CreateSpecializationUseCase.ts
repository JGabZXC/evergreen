import {
  ICreateSpecializationUseCase,
  CreateSpecializationRequest,
} from "./ICreateSpecializationUseCase";
import { ISpecializationRepository } from "../../../domain/interfaces/ISpecializationRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { SpecializationResponse } from "../../dto/SpecializationResponse";
import { SpecializationMapper } from "../../../infrastructure/mapper/SpecializationMapper";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";

export class CreateSpecializationUseCase
  implements ICreateSpecializationUseCase
{
  constructor(
    public readonly specializationRepository: ISpecializationRepository,
    public readonly userRepository: IUserRepository,
  ) {}

  async execute(
    request: CreateSpecializationRequest,
  ): Promise<SpecializationResponse> {
    // Resolve the creator's user profile id (repository.create expects a userProfileId)
    const domainUser = await this.userRepository.findById(request.creatorId, true);
    if (!domainUser) throw new NotFoundError("Authenticated user not found");
    const userProfileId = domainUser.userProfile?.id;
    if (!userProfileId) throw new NotFoundError("User profile not found for authenticated user");

    const domainSpecialization = await this.specializationRepository.create(
      request.data,
      userProfileId,
    );

    return SpecializationMapper.toResponseShallow(domainSpecialization);
  }
}
