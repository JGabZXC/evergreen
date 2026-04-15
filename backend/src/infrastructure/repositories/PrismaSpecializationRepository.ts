import { Prisma } from "../../generated/prisma/client";
import {
  GetAllSpecializationFilter,
  ISpecializationRepository,
} from "../../domain/interfaces/ISpecializationRepository";
import { SpecializationCreateRequest } from "../../application/dto/SpecializationCreateRequest";
import { PaginatedResult } from "../../domain/common/Pagination";
import prisma from "../database/prisma/db";
import { NotFoundError } from "../../interfaces/http/middleware/HttpErrors";
import { SpecializationMapper } from "../mapper/SpecializationMapper";
import { Specialization } from "../../domain/entities/Specialization";

export class PrismaSpecializationRepository
  implements ISpecializationRepository
{
  async getAll(
    filter: GetAllSpecializationFilter,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Specialization>> {
    const skip = (page - 1) * limit;

    const where: Prisma.SpecializationWhereInput = {};

    if (filter.userId) where.userProfile = { userId: filter.userId };
    if (filter.name) where.name = filter.name;
    if (typeof filter.isApproved === "boolean")
      where.isApproved = filter.isApproved;
    if (filter.approvedById && filter.approvedById !== "all")
      where.approvedById = filter.approvedById;

    const [rawSpecialization, totalItems] = await Promise.all([
      prisma.specialization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          approvedBy: true,
        },
      }),
      prisma.specialization.count({ where }),
    ]);

    const data = rawSpecialization.map(SpecializationMapper.toDomain);
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

  async findById(id: string): Promise<Specialization | null> {
    const rawSpecialization = await prisma.specialization.findUnique({
      where: { id }
    });

    if(!rawSpecialization) return null;

    return SpecializationMapper.toDomain(rawSpecialization);
  }

  async findAllByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Specialization>> {
    return this.getAll({ userId }, page, limit);
  }

  async create(
    data: SpecializationCreateRequest,
    userProfileId: string,
  ): Promise<Specialization> {
    const rawSpecialization = await prisma.specialization.create({
      data: {
        userProfileId,
        name: data.name,
        description: data.description || null,
      },
    });

    return SpecializationMapper.toDomain(rawSpecialization);
  }

  async update(
    data: Prisma.SpecializationUpdateInput,
    specializationId: string,
  ): Promise<boolean> {
    try {
      await prisma.specialization.update({
        where: { id: specializationId },
        data,
      });

      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new NotFoundError(`Specialization with id ${specializationId} not found`);
      }

      if(error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P2025") {
        throw new NotFoundError(`Specialization with id ${specializationId} not found`);
      }

      throw error;
    }
  }
}
