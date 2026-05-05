import { UpdateSectionRequest } from "../../schemas/sectionSchemas";

export interface UpdateSectionUseCaseRequest {
  sectionId: string;
  data: UpdateSectionRequest;
}

export interface IUpdateSectionUseCase {
  execute(request: UpdateSectionUseCaseRequest): Promise<boolean>;
}