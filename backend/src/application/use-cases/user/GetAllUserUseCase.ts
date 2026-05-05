import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { PaginatedResult } from "../../../domain/common/Pagination";
import { IGetAllUserUseCase, GetAllUserUseCaseRequest } from "./IGetAllUserUseCase";

export type { GetAllUserFilter } from "../../../domain/interfaces/IUserRepository";

export class GetAllUserUseCase implements IGetAllUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: GetAllUserUseCaseRequest): Promise<PaginatedResult<User>> {
    const { filter, page = 1, limit = 10 } = request;

    const currentPage = Number.isNaN(page) ? 1 : Math.max(1, page);
    const pageSize = Number.isNaN(limit) ? 10 : Math.max(1, limit);

    return this.userRepository.getAll(filter, currentPage, pageSize);
  }
}
