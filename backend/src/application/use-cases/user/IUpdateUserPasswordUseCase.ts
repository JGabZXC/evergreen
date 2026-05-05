import { UpdatePasswordRequestWithUserId } from "../../dto/UpdatePasswordRequest";
import { UserResponse } from "../../dto/UserResponse";

export type UpdateUserPasswordUseCaseRequest =
  UpdatePasswordRequestWithUserId & { currentPassword?: string };

export interface IUpdateUserPasswordUseCase {
  execute(request: UpdateUserPasswordUseCaseRequest): Promise<UserResponse>;
}