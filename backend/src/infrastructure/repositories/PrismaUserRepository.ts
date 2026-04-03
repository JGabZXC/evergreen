import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { User } from "../../domain/entities/User";
import { NotFoundError } from "../../interfaces/http/middleware/HttpErrors";
import prisma from "../database/prisma/db";
import { UserMapper } from "../mapper/UserMapper";
import { Prisma, User as PrismaUser } from "../../generated/prisma/client";
import { Role } from "../../generated/prisma/enums";
import { PaginatedResult } from "../../domain/common/Pagination";
import {
  GetAllUserFilter,
  UserCredentials,
} from "../../domain/interfaces/IUserRepository";
import { UserCreateRequest } from "../../application/dto/UserCreateRequest";

export class PrismaUserRepository implements IUserRepository {
  async findRawByAccountNumberOrEmail(
    identifier: string,
  ): Promise<PrismaUser | null> {
    const isNumberIdentifier = /^\d+$/.test(identifier);

    const whereFilter: Prisma.UserWhereInput = {
      OR: [{ email: identifier }],
    };

    if (isNumberIdentifier) {
      whereFilter.OR!.push({ accountNumber: Number(identifier) });
    }

    return prisma.user.findFirst({ where: whereFilter });
  }

  async getAll(
    filter: GetAllUserFilter,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<User>> {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filter.email) {
      where.email = { contains: filter.email, mode: "insensitive" };
    }

    if (filter.role) {
      where.role = { equals: filter.role as Role };
    }

    if (typeof filter.isActive === "boolean") {
      where.isActive = filter.isActive;
    }

    const [rawUsers, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const data = rawUsers.map(UserMapper.toDomain);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findById(id: string, nested: boolean = false): Promise<User | null> {
    // Include the userProfile and its reverse relations so the mapper can build a full domain object
    const include = {
      userProfile: {
          include: {
            userAddress: true,
            teacherAcademicBackground: { include: { approvedBy: true } },
            specializations: { include: { approvedBy: true } },
          },
      },
    };

    const rawUser = await prisma.user.findUnique({
      where: { id },
      ...(nested ? {include} : {})
    });
    if (!rawUser) return null;
    return UserMapper.toDomain(rawUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const rawUser = await prisma.user.findUnique({ where: { email } });
    if (!rawUser) return null;
    return UserMapper.toDomain(rawUser);
  }

  async findCredentialsById(id: string): Promise<UserCredentials | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async create(data: UserCreateRequest, creatorId: string): Promise<User> {
    const rawUser = await prisma.user.create({
      data: {
        email: data.user.email,
        password: data.user.password, // This should be hashed password
        role: data.user.role,

        insertedBy: {
          connect: { id: creatorId },
        },

        userProfile: {
          create: {
            firstName: data.userProfile.firstName,
            middleName: data.userProfile?.middleName || null,
            lastName: data.userProfile.lastName,
            dateOfBirth: new Date(data.userProfile.dateOfBirth),
            contactNumber: data.userProfile.contactNumber,

            userAddress: {
              create: {
                homeAddress: data.userAddress.homeAddress,
                barangay: data.userAddress.barangay,
                municipality: data.userAddress.municipality,
                province: data.userAddress.province,
                region: data.userAddress.region,
              },
            },
          },
        },
      },
    });

    return UserMapper.toDomain(rawUser);
  }

  async update(user: User): Promise<User | undefined> {
    try {
      const rawUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
      return UserMapper.toDomain(rawUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("User not found");
        }

        throw error;
      }
    }
  }

  async updatePassword(
    userId: string,
    newPasswordHash: string,
  ): Promise<boolean | undefined> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: newPasswordHash },
      });

      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("User not found");
        }

        throw error;
      }
    }
  }
}
