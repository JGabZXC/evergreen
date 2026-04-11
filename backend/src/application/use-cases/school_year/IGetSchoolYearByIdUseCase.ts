import { IUseCase } from "../../../domain/common/IUseCase";
import {
  SchoolYearNestedResponse,
  SchoolYearResponse,
} from "../../dto/SchoolYearResponse";

export interface GetSchoolYearByIdUseCaseRequest {
  id: string;
  nested: boolean;
}

export type IGetSchoolYearByIdUseCase = IUseCase<
  GetSchoolYearByIdUseCaseRequest,
  SchoolYearResponse | SchoolYearNestedResponse
>;
