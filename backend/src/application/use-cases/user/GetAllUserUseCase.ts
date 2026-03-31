import { User } from "../../../domain/entities/User";
import {
  GetAllUserFilter,
  IUserRepository,
} from "../../../domain/interfaces/IUserRepository";
import { PaginatedResult } from "../../../domain/common/Pagination";

export type { GetAllUserFilter };

export class GetAllUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    filter: GetAllUserFilter,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<User>> {
    const currentPage = Number.isNaN(page) ? 1 : Math.max(1, page);
    const pageSize = Number.isNaN(limit) ? 10 : Math.max(1, limit);

    return this.userRepository.getAll(filter, currentPage, pageSize);
  }
}
