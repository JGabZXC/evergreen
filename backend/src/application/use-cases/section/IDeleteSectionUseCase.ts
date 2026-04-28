import { IUseCase } from "../../../domain/common/IUseCase";

export interface DeleteSectionUseCaseRequest {
  sectionId: string;
}

export type IDeleteSectionUseCase = IUseCase<
  DeleteSectionUseCaseRequest,
  boolean
>;

