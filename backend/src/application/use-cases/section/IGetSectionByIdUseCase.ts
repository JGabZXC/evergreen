import { IUseCase } from "../../../domain/common/IUseCase";
import {
  SectionNestedResponse,
  SectionResponse,
} from "../../dto/SectionResponse";

export interface GetSectionByIdUseCaseRequest {
  sectionId: string;
  nested?: boolean;
}

export type IGetSectionByIdUseCase = IUseCase<
  GetSectionByIdUseCaseRequest,
  SectionResponse | SectionNestedResponse
>;

