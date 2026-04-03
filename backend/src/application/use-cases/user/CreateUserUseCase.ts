import { CreateUserRequest, ICreateUserUseCase } from "./ICreateUserUseCase";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { UserResponse } from "../../dto/UserResponse";
import { UserMapper } from "../../../infrastructure/mapper/UserMapper";

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<UserResponse> {
    const domainUser = await this.userRepository.create(
      request.data,
      request.creatorId,
    );

    return UserMapper.toResponseShallow(domainUser);
  }
}
