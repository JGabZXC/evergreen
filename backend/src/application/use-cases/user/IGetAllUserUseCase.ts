import { PaginatedResult } from "../../../domain/common/Pagination";
import { User } from "../../../domain/entities/User";
import { GetAllUserFilter } from "../../../domain/interfaces/IUserRepository";

export interface GetAllUserUseCaseRequest {
  filter: GetAllUserFilter;
  page?: number;
  limit?: number;
}

export interface IGetAllUserUseCase {
  execute(request: GetAllUserUseCaseRequest): Promise<PaginatedResult<User>>;
}