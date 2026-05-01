import { User } from "../../../domain/entities/User";
import {
  GetAllUserFilter,
  IUserRepository,
} from "../../../domain/interfaces/IUserRepository";
import { PaginatedResult } from "../../../domain/common/Pagination";
import { IUseCase } from "../../../domain/common/IUseCase";

export type { GetAllUserFilter };

export interface GetAllUserUseCaseRequest {
  filter: GetAllUserFilter;
  page?: number;
  limit?: number;
}

export class GetAllUserUseCase implements IUseCase<GetAllUserUseCaseRequest, PaginatedResult<User>> {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: GetAllUserUseCaseRequest): Promise<PaginatedResult<User>> {
    const { filter, page = 1, limit = 10 } = request;

    const currentPage = Number.isNaN(page) ? 1 : Math.max(1, page);
    const pageSize = Number.isNaN(limit) ? 10 : Math.max(1, limit);

    return this.userRepository.getAll(filter, currentPage, pageSize);
  }
}
