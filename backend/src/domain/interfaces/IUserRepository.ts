import { User } from "../entities/User";
import {User as PrismaUser} from "../../generated/prisma/client"
import { PaginatedResult } from "../common/Pagination";
import {UserCreateRequest} from "../../application/dto/UserCreateRequest";

export interface GetAllUserFilter {
  id?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserCredentials {
  id: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

export interface IUserRepository {
  getAll(
    filter: GetAllUserFilter,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<User>>;
  findRawByAccountNumberOrEmail(identifier: string): Promise<PrismaUser | null>
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findCredentialsById(id: string): Promise<UserCredentials | null>;
  create(data: UserCreateRequest, creatorId: string): Promise<User>;
  update(user: User): Promise<User | undefined>;
  updatePassword(
    userId: string,
    newPasswordHash: string,
  ): Promise<boolean | undefined>;
}
