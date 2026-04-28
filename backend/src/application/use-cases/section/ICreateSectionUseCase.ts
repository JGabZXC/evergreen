import { CreateSectionRequest } from "../../schemas/sectionSchemas";
import { IUseCase } from "../../../domain/common/IUseCase";
import { Section } from "../../../domain/entities/Section";

export interface CreateSectionUseCaseRequest {
  data: CreateSectionRequest;
}

export type ICreateSectionUseCase = IUseCase<
  CreateSectionUseCaseRequest,
  Section
>;

