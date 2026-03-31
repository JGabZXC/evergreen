import { User } from "../../domain/entities/User";
import {User as PrismaUser} from "../../generated/prisma/client"
import {UserResponse} from "../../application/dto/UserResponse";
import {UserAdminResponse} from "../../application/dto/UserAdminResponse";

export class UserMapper {
  static toDomain(raw: PrismaUser) {
    return new User(
      raw.id,
      Number(raw.accountNumber),
      raw.email,
      raw.role,
      raw.isActive,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toResponse(domainUser: User): UserResponse {
    return {
      id: domainUser.id,
      accountNumber: domainUser.accountNumber,
      email: domainUser.email,
      role: domainUser.role,
    }
  }

  static toAdminResponse(domainUser: User): UserAdminResponse {
    return {
      id: domainUser.id,
      accountNumber: domainUser.accountNumber,
      email: domainUser.email,
      role: domainUser.role,
      isActive: domainUser.isActive,
      createdAt: domainUser.createdAt.toISOString(),
      updatedAt: domainUser.updatedAt.toISOString()
    }
  }
}
