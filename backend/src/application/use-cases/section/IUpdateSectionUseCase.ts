import { UpdateSectionRequest } from "../../schemas/sectionSchemas";
import { IUseCase } from "../../../domain/common/IUseCase";

export interface UpdateSectionUseCaseRequest {
  sectionId: string;
  data: UpdateSectionRequest;
}

export type IUpdateSectionUseCase = IUseCase<
  UpdateSectionUseCaseRequest,
  boolean
>;

