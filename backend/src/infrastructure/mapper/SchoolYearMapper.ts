import {
  SchoolYear as PrismaSchoolYear,
  SchoolYearStatusHistory as PrismaSchoolYearStatusHistory,
  User as PrismaUser,
} from "../../generated/prisma/client";
import { SchoolYear } from "../../domain/entities/SchoolYear";
import { SchoolYearStatusMapper } from "./SchoolYearStatusMapper";
import { UserMapper } from "./UserMapper";

interface WithRelations extends PrismaSchoolYear {
  createdBy?: PrismaUser | null;
  schoolYearStatusHistory?:
    | (PrismaSchoolYearStatusHistory & {
        changedBy?: PrismaUser | null;
      })[]
    | null;
}

export class SchoolYearMapper {
  static toDomain(raw: WithRelations) {
    return new SchoolYear(
      raw.id,
      raw.startDate,
      raw.endDate,
      raw.gracePeriod,
      raw.status,
      raw.createdById,
      raw.createdAt,
      raw.updatedAt,

      // NESTED PROPERTIES
      raw.createdBy ? UserMapper.toDomain(raw.createdBy) : null,
      raw.schoolYearStatusHistory
        ? raw.schoolYearStatusHistory.map(SchoolYearStatusMapper.toDomain)
        : null,
    );
  }

  static toResponseShallow(domain: SchoolYear) {
    return {
      id: domain.id,
      startDate: domain.startDate.toISOString(),
      endDate: domain.endDate.toISOString(),
      gracePeriod: domain.gracePeriod,
      status: domain.status,
      createdById: domain.createdById,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }

  static toResponseDeep(domain: SchoolYear) {
    return {
      ...SchoolYearMapper.toResponseShallow(domain),
      createdBy: domain.createdBy
        ? UserMapper.toResponseShallow(domain.createdBy)
        : null,
      schoolYearStatusHistory: domain.schoolYearStatusHistory
        ? domain.schoolYearStatusHistory.map(
            SchoolYearStatusMapper.toResponseShallow,
          )
        : null,
    };
  }
}
