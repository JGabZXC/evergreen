import { Prisma } from "../../generated/prisma/client";
import {
  CreateSchoolYearRepositoryRequest,
  CreateSchoolYearStatusHistoryRequest,
  GetAllSchoolYearFilter,
  ISchoolYearRepository,
  UpdateSchoolYearRepositoryRequest,
} from "../../domain/interfaces/ISchoolYearRepository";
import { PaginatedResult } from "../../domain/common/Pagination";
import { SchoolYear } from "../../domain/entities/SchoolYear";
import { SchoolYearStatusHistory } from "../../domain/entities/SchoolYearStatusHistory";
import prisma from "../database/prisma/db";
import { SchoolYearMapper } from "../mapper/SchoolYearMapper";
import { SchoolYearStatusMapper } from "../mapper/SchoolYearStatusMapper";
import { NotFoundError } from "../../interfaces/http/middleware/HttpErrors";

export class PrismaSchoolYearRepository implements ISchoolYearRepository {
  async getAll(
    filter: GetAllSchoolYearFilter,
    page: number,
    limit: number,
    nested: boolean,
  ): Promise<PaginatedResult<SchoolYear>> {
    const skip = (page - 1) * limit;
    const where: Prisma.SchoolYearWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.changedById && filter.changedById !== "all") {
      where.schoolYearStatusHistory = {
        some: {
          changedById: filter.changedById,
        },
      };
    }

    const findArgs: Prisma.SchoolYearFindManyArgs = {
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    };

    if (nested) {
      findArgs.include = {
        createdBy: true,
        schoolYearStatusHistory: {
          orderBy: { changedAt: "desc" },
          include: {
            changedBy: true,
          },
        },
      };
    }

    const [rawSchoolYears, totalItems] = await Promise.all([
      prisma.schoolYear.findMany(findArgs),
      prisma.schoolYear.count({ where }),
    ]);

    const data = rawSchoolYears.map(SchoolYearMapper.toDomain);
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

  async findById(id: string, nested: boolean = false): Promise<SchoolYear | null> {
    const include = {
      createdBy: true,
      schoolYearStatusHistory: {
        orderBy: { changedAt: "desc" as const },
        include: {
          changedBy: true,
        },
      },
    };

    const rawSchoolYear = await prisma.schoolYear.findUnique({
      where: { id },
      ...(nested ? { include } : {}),
    });

    if (!rawSchoolYear) {
      return null;
    }

    return SchoolYearMapper.toDomain(rawSchoolYear);
  }

  async create(data: CreateSchoolYearRepositoryRequest): Promise<SchoolYear> {
    const rawSchoolYear = await prisma.schoolYear.create({
      data: {
        startDate: data.startDate,
        endDate: data.endDate,
        gracePeriod: data.gracePeriod,
        status: data.status,
        createdById: data.createdById,
      },
    });

    return SchoolYearMapper.toDomain(rawSchoolYear);
  }

  async update(
    data: UpdateSchoolYearRepositoryRequest,
    schoolYearId: string,
  ): Promise<boolean> {
    const updateData: Prisma.SchoolYearUpdateInput = {};

    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate;
    }

    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate;
    }

    if (data.gracePeriod !== undefined) {
      updateData.gracePeriod = data.gracePeriod;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    try {
      await prisma.schoolYear.update({
        where: { id: schoolYearId },
        data: updateData,
      });

      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`School year with id ${schoolYearId} not found`);
      }

      throw error;
    }
  }

  async delete(schoolYearId: string): Promise<boolean> {
    try {
      await prisma.schoolYear.delete({
        where: { id: schoolYearId },
      });

      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`School year with id ${schoolYearId} not found`);
      }

      throw error;
    }
  }

  async createStatusHistory(
    data: CreateSchoolYearStatusHistoryRequest,
  ): Promise<SchoolYearStatusHistory> {
    const rawStatusHistory = await prisma.schoolYearStatusHistory.create({
      data: {
        schoolYearId: data.schoolYearId,
        previousStatus: data.previousStatus,
        newStatus: data.newStatus,
        remarks: data.remarks ?? null,
        changedById: data.changedById ?? null,
      },
      include: {
        changedBy: true,
      },
    });

    return SchoolYearStatusMapper.toDomain(rawStatusHistory);
  }
}
