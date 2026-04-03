import { CreateUserRequest, ICreateUserUseCase } from "./ICreateUserUseCase";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { UserResponse } from "../../dto/UserResponse";
import { UserMapper } from "../../../infrastructure/mapper/UserMapper";
import {IPasswordService} from "../../../domain/interfaces/IPasswordService";

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
      private readonly userRepository: IUserRepository,
      private readonly passwordService: IPasswordService
  ) {}

  async execute(request: CreateUserRequest): Promise<UserResponse> {
    const newData = {
      ...request.data,
      user: {
        ...request.data.user,
        password: await this.passwordService.hash(request.data.user.password),
      }
    };

    const domainUser = await this.userRepository.create(
      newData,
      request.creatorId,
    );

    return UserMapper.toResponseShallow(domainUser);
  }
}
