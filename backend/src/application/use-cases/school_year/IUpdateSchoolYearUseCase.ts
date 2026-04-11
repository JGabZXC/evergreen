import { IUseCase } from "../../../domain/common/IUseCase";
import { SchoolYearUpdateRequest } from "../../dto/SchoolYearRequest";

export interface UpdateSchoolYearUseCaseRequest {
  id: string;
  data: SchoolYearUpdateRequest;
  updaterId: string;
}

export type IUpdateSchoolYearUseCase = IUseCase<
  UpdateSchoolYearUseCaseRequest,
  boolean
>;
