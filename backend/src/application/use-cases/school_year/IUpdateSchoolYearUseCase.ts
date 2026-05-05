import { SchoolYearUpdateRequest } from "../../dto/SchoolYearRequest";

export interface UpdateSchoolYearUseCaseRequest {
  id: string;
  data: SchoolYearUpdateRequest & {
    changedById?: string | undefined;
  };
  updaterId: string;
}

export interface IUpdateSchoolYearUseCase {
  execute(request: UpdateSchoolYearUseCaseRequest): Promise<boolean>;
}