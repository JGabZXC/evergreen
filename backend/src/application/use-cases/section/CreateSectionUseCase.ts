import {
  CreateSectionUseCaseRequest,
  ICreateSectionUseCase,
} from "./ICreateSectionUseCase";
import { ISectionRepository } from "../../../domain/interfaces/ISectionRepository";

export class CreateSectionUseCase implements ICreateSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(request: CreateSectionUseCaseRequest) {
    return this.sectionRepository.create(request.data);
  }
}

