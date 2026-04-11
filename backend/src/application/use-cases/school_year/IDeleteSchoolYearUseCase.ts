import { IUseCase } from "../../../domain/common/IUseCase";

export interface DeleteSchoolYearUseCaseRequest {
  id: string;
}

export type IDeleteSchoolYearUseCase = IUseCase<
  DeleteSchoolYearUseCaseRequest,
  boolean
>;
