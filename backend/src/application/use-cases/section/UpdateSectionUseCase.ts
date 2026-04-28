import {
  IUpdateSectionUseCase,
  UpdateSectionUseCaseRequest,
} from "./IUpdateSectionUseCase";
import { ISectionRepository } from "../../../domain/interfaces/ISectionRepository";

export class UpdateSectionUseCase implements IUpdateSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(request: UpdateSectionUseCaseRequest): Promise<boolean> {
    const { data, sectionId } = request;

    return this.sectionRepository.update(data, sectionId);
  }
}

