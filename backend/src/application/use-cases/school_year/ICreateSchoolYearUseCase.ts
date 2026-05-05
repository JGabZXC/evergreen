import { SchoolYearCreateRequest } from "../../dto/SchoolYearRequest";
import { SchoolYearResponse } from "../../dto/SchoolYearResponse";

export interface CreateSchoolYearUseCaseRequest {
  data: SchoolYearCreateRequest;
  creatorId: string;
}

export interface ICreateSchoolYearUseCase {
  execute(request: CreateSchoolYearUseCaseRequest): Promise<SchoolYearResponse>;
}