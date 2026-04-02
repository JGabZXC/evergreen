import { IUseCase } from "../../../domain/common/IUseCase";
import { UserCreateRequest } from "../../dto/UserCreateRequest";
import { UserResponse } from "../../dto/UserResponse";

export interface CreateUserRequest {
  data: UserCreateRequest;
  creatorId: string;
}

export type ICreateUserUseCase = IUseCase<CreateUserRequest, UserResponse>;
