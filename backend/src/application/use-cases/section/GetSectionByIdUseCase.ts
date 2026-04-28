import {
  GetSectionByIdUseCaseRequest,
  IGetSectionByIdUseCase,
} from "./IGetSectionByIdUseCase";
import { ISectionRepository } from "../../../domain/interfaces/ISectionRepository";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import {
  SectionNestedResponse,
  SectionResponse,
} from "../../dto/SectionResponse";
import { SectionMapper } from "../../../infrastructure/mapper/SectionMapper";

export class GetSectionByIdUseCase implements IGetSectionByIdUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(
    request: GetSectionByIdUseCaseRequest,
  ): Promise<SectionResponse | SectionNestedResponse> {
    const { sectionId, nested = false } = request;

    const section = await this.sectionRepository.findById(sectionId, nested);
    if (!section) {
      throw new NotFoundError(`Section with id ${sectionId} not found`);
    }

    return nested
      ? SectionMapper.toResponseDeep(section)
      : SectionMapper.toResponseShallow(section);
  }
}

