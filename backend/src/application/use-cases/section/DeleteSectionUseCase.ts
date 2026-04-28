import {
  DeleteSectionUseCaseRequest,
  IDeleteSectionUseCase,
} from "./IDeleteSectionUseCase";
import { ISectionRepository } from "../../../domain/interfaces/ISectionRepository";

export class DeleteSectionUseCase implements IDeleteSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(request: DeleteSectionUseCaseRequest): Promise<boolean> {
    return this.sectionRepository.delete(request.sectionId);
  }
}

