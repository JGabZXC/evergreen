import { SpecializationCreateRequest } from "../../dto/SpecializationCreateRequest";
import { SpecializationResponse } from "../../dto/SpecializationResponse";

export interface CreateSpecializationRequest {
  data: SpecializationCreateRequest;
  creatorId: string;
}

export interface ICreateSpecializationUseCase {
  execute(request: CreateSpecializationRequest): Promise<SpecializationResponse>;
}