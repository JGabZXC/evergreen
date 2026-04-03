import { IUseCase } from "../../../domain/common/IUseCase";
import { SpecializationCreateRequest } from "../../dto/SpecializationCreateRequest";
import { SpecializationResponse } from "../../dto/SpecializationResponse";

export interface UpdateSpecializationRequest {
  data: Partial<SpecializationCreateRequest>;
  id: string;
}

export type IUpdateSpecializationUseCase = IUseCase<
  UpdateSpecializationRequest,
  SpecializationResponse
>;

