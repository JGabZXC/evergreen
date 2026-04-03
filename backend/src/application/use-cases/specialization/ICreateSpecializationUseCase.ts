import { IUseCase } from "../../../domain/common/IUseCase";
import { SpecializationCreateRequest } from "../../dto/SpecializationCreateRequest";
import { SpecializationResponse } from "../../dto/SpecializationResponse";

export interface CreateSpecializationRequest {
  data: SpecializationCreateRequest;
  creatorId: string;
}

export type ICreateSpecializationUseCase = IUseCase<
  CreateSpecializationRequest,
  SpecializationResponse
>;

