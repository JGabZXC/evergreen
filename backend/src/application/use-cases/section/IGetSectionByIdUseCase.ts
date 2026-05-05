import {
  SectionNestedResponse,
  SectionResponse,
} from "../../dto/SectionResponse";

export interface GetSectionByIdUseCaseRequest {
  sectionId: string;
  nested?: boolean;
}

export interface IGetSectionByIdUseCase {
  execute(
    request: GetSectionByIdUseCaseRequest
  ): Promise<SectionResponse | SectionNestedResponse>;
}