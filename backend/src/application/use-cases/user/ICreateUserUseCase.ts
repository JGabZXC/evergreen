import { UserCreateRequest } from "../../dto/UserCreateRequest";
import { UserResponse } from "../../dto/UserResponse";

export interface CreateUserRequest {
  data: UserCreateRequest;
  creatorId: string;
}

export interface ICreateUserUseCase {
  execute(request: CreateUserRequest): Promise<UserResponse>;
}