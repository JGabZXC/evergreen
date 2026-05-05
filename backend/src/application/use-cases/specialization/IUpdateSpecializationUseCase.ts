import { SpecializationCreateRequest } from "../../dto/SpecializationCreateRequest";

export interface UpdateSpecializationRequest {
  data: Partial<SpecializationCreateRequest>;
  id: string;
}

export interface IUpdateSpecializationUseCase {
  execute(request: UpdateSpecializationRequest): Promise<boolean>;
}