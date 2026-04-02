import { IUseCase } from "../../../domain/common/IUseCase";
import { UpdatePasswordRequestWithUserId } from "../../dto/UpdatePasswordRequest";
import { UserResponse } from "../../dto/UserResponse";

// Use-case request includes optional currentPassword when a user updates their own password
export type UpdateUserPasswordUseCaseRequest =
  UpdatePasswordRequestWithUserId & { currentPassword?: string };

export type IUpdateUserPasswordUseCase = IUseCase<
  UpdateUserPasswordUseCaseRequest,
  UserResponse
>;
