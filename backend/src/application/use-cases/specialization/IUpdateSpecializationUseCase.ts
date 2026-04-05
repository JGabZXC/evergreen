import { IUseCase } from "../../../domain/common/IUseCase";
import { SpecializationCreateRequest } from "../../dto/SpecializationCreateRequest";

export interface UpdateSpecializationRequest {
  data: Partial<SpecializationCreateRequest>;
  id: string;
}

export type IUpdateSpecializationUseCase = IUseCase<
  UpdateSpecializationRequest,
  boolean
>;

