import { Prisma } from "../../generated/prisma/client";
import prisma from "../database/prisma/db";
import {
  GetAllSectionFilter,
  ISectionRepository,
} from "../../domain/interfaces/ISectionRepository";
import { PaginatedResult } from "../../domain/common/Pagination";
import { Section } from "../../domain/entities/Section";
import { SectionMapper } from "../mapper/SectionMapper";
import { NotFoundError } from "../../interfaces/http/middleware/HttpErrors";
import {
  CreateSectionRequest,
  UpdateSectionRequest,
} from "../../application/schemas/sectionSchemas";

export class PrismaSectionRepository implements ISectionRepository {
  async getAll(
    filter: GetAllSectionFilter,
    page: number,
    limit: number,
    nested: boolean,
  ): Promise<PaginatedResult<Section>> {
    const skip = (page - 1) * limit;
    const where: Prisma.SectionWhereInput = {};

    if (filter.roomId) where.roomId = filter.roomId;
    if (filter.schoolYearId) where.schoolYearId = filter.schoolYearId;
    if (filter.adviserId) where.adviserId = filter.adviserId;
    if (filter.name) where.name = filter.name;

    const findArgs: Prisma.SectionFindManyArgs = {
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    };

    if (nested) {
      findArgs.include = {
        room: {
          include: {
            createdBy: true,
          },
        },
        schoolYear: {
          include: {
            createdBy: true,
            schoolYearStatusHistory: {
              orderBy: { changedAt: "desc" },
              include: { changedBy: true },
            },
          },
        },
        adviser: {
          include: {
            userProfile: {
              include: {
                userAddress: true,
                teacherAcademicBackground: { include: { approvedBy: true } },
                specializations: { include: { approvedBy: true } },
              },
            },
          },
        },
      };
    }

    const [rawSections, totalItems] = await Promise.all([
      prisma.section.findMany(findArgs),
      prisma.section.count({ where }),
    ]);

    const data = rawSections.map(SectionMapper.toDomain);
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

  async findById(sectionId: string, nested: boolean = false): Promise<Section | null> {
    const include = {
      room: {
        include: {
          createdBy: true,
        },
      },
      schoolYear: {
        include: {
          createdBy: true,
          schoolYearStatusHistory: {
            orderBy: { changedAt: "desc" as const },
            include: { changedBy: true },
          },
        },
      },
      adviser: {
        include: {
          userProfile: {
            include: {
              userAddress: true,
              teacherAcademicBackground: { include: { approvedBy: true } },
              specializations: { include: { approvedBy: true } },
            },
          },
        },
      },
    };

    const rawSection = await prisma.section.findUnique({
      where: { id: sectionId },
      ...(nested ? { include } : {}),
    });

    if (!rawSection) return null;

    return SectionMapper.toDomain(rawSection);
  }

  async create(data: CreateSectionRequest): Promise<Section> {
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
      select: { capacity: true },
    });

    if (!room) {
      throw new NotFoundError(`Room with id ${data.roomId} not found`);
    }

    const rawSection = await prisma.section.create({
      data: {
        roomId: data.roomId,
        schoolYearId: data.schoolYearId,
        adviserId: data.adviserId,
        name: data.name,
        capacity: room.capacity,
      },
    });

    return SectionMapper.toDomain(rawSection);
  }

  async update(
    data: UpdateSectionRequest,
    sectionId: string,
  ): Promise<boolean> {
    const updateData: Prisma.SectionUncheckedUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.adviserId !== undefined) {
      updateData.adviserId = data.adviserId;
    }

    if (data.schoolYearId !== undefined) {
      updateData.schoolYearId = data.schoolYearId;
    }

    let roomIdToUse: string;
    if (data.roomId) {
      roomIdToUse = data.roomId;
    } else {
      const existingSection = await prisma.section.findUnique({
        where: { id: sectionId },
        select: { roomId: true },
      });

      if (!existingSection) {
        throw new NotFoundError(`Section with id ${sectionId} not found`);
      }

      roomIdToUse = existingSection.roomId;
    }

    const room = await prisma.room.findUnique({
      where: { id: roomIdToUse },
      select: { capacity: true },
    });

    if (!room) {
      throw new NotFoundError(`Room with id ${roomIdToUse} not found`);
    }

    updateData.capacity = room.capacity;

    if (data.roomId !== undefined) {
      updateData.roomId = data.roomId;
    }

    try {
      await prisma.section.update({
        where: { id: sectionId },
        data: updateData,
      });

      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`Section with id ${sectionId} not found`);
      }

      throw error;
    }
  }

  async delete(sectionId: string): Promise<boolean> {
    try {
      await prisma.section.delete({
        where: { id: sectionId },
      });

      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`Section with id ${sectionId} not found`);
      }

      throw error;
    }
  }
}
