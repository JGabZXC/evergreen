import { CreateSectionRequest } from "../../schemas/sectionSchemas";
import { Section } from "../../../domain/entities/Section";

export interface CreateSectionUseCaseRequest {
  data: CreateSectionRequest;
}

export interface ICreateSectionUseCase {
  execute(request: CreateSectionUseCaseRequest): Promise<Section>;
}