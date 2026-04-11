import {
  SchoolYearStatusHistory as PrismaSchoolYearStatusHistory,
  User as PrismaUser,
} from "../../generated/prisma/client";
import { SchoolYearStatusHistory } from "../../domain/entities/SchoolYearStatusHistory";
import { UserMapper } from "./UserMapper";

interface WithRelations extends PrismaSchoolYearStatusHistory {
  changedBy?: PrismaUser | null;
}

export class SchoolYearStatusMapper {
  static toDomain(raw: WithRelations) {
    return new SchoolYearStatusHistory(
      raw.id,
      raw.schoolYearId,
      raw.previousStatus,
      raw.newStatus,
      raw.remarks,
      raw.changedById,
      raw.changedAt,

      // NESTED PROPERTIES
      raw.changedBy ? UserMapper.toDomain(raw.changedBy) : null,
    );
  }

  static toResponseShallow(domain: SchoolYearStatusHistory) {
    return {
      id: domain.id,
      schoolYearId: domain.schoolYearId,
      previousStatus: domain.previousStatus,
      newStatus: domain.newStatus,
      remarks: domain.remarks,
      changedById: domain.changedById,
      changedAt: domain.changedAt.toISOString(),

      // NESTED PROPERTIES
      changedBy: domain.changedBy
        ? UserMapper.toResponseShallow(domain.changedBy)
        : null,
    };
  }

  static toResponseDeep(domain: SchoolYearStatusHistory) {
    return this.toResponseShallow(domain);
  }
}
