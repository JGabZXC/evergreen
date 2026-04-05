import {
  IUpdateSpecializationUseCase,
  UpdateSpecializationRequest,
} from "./IUpdateSpecializationUseCase";
import { ISpecializationRepository } from "../../../domain/interfaces/ISpecializationRepository";

export class UpdateSpecializationUseCase
  implements IUpdateSpecializationUseCase
{
  constructor(
    public readonly specializationRepository: ISpecializationRepository,
  ) {}

  async execute(
    request: UpdateSpecializationRequest,
  ): Promise<boolean> {
    const newData: Record<string, string> = {};

    if (request.data.name) {
      newData.name = request.data.name;
    }

    if (request.data.description) {
      newData.description= request.data.description;
    }

    return await this.specializationRepository.update(
        newData,
        request.id,
    );
  }
}
