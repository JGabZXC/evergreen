import {
  SchoolYearNestedResponse,
  SchoolYearResponse,
} from "../../dto/SchoolYearResponse";

export interface GetSchoolYearByIdUseCaseRequest {
  id: string;
  nested: boolean;
}

export interface IGetSchoolYearByIdUseCase {
  execute(
    request: GetSchoolYearByIdUseCaseRequest
  ): Promise<SchoolYearResponse | SchoolYearNestedResponse>;
}