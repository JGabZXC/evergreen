import {
  Room as PrismaRoom,
  SchoolYear as PrismaSchoolYear,
  SchoolYearStatusHistory as PrismaSchoolYearStatusHistory,
  Section as PrismaSection,
  User as PrismaUser,
} from "../../generated/prisma/client";
import { Section } from "../../domain/entities/Section";
import { RoomMapper } from "./RoomMapper";
import { SchoolYearMapper } from "./SchoolYearMapper";
import { UserMapper } from "./UserMapper";

interface WithRelations extends PrismaSection {
  room?: (PrismaRoom & { createdBy?: PrismaUser | null }) | null;
  schoolYear?:
    | (PrismaSchoolYear & {
        createdBy?: PrismaUser | null;
        schoolYearStatusHistory?:
          | (PrismaSchoolYearStatusHistory & {
              changedBy?: PrismaUser | null;
            })[]
          | null;
      })
    | null;
  adviser?: PrismaUser | null;
}

export class SectionMapper {
  static toDomain(raw: WithRelations): Section {
    return new Section(
      raw.id,
      raw.roomId,
      raw.schoolYearId,
      raw.adviserId ?? "",
      raw.name,
      raw.capacity,
      raw.createdAt,
      raw.updatedAt,

      // NESTED PROPERTIES
      raw.room ? RoomMapper.toDomain(raw.room) : null,
      raw.schoolYear ? SchoolYearMapper.toDomain(raw.schoolYear) : null,
      raw.adviser ? UserMapper.toDomain(raw.adviser) : null,
    );
  }

  static toResponseShallow(domain: Section) {
    return {
      id: domain.id,
      roomId: domain.roomId,
      schoolYearId: domain.schoolYearId,
      adviserId: domain.adviserId,
      name: domain.name,
      capacity: domain.capacity,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }

  static toResponseDeep(domain: Section) {
    return {
      ...SectionMapper.toResponseShallow(domain),

      // NESTED PROPERTIES
      room: domain.room ? RoomMapper.toResponseDeep(domain.room) : null,
      schoolYear: domain.schoolYear
        ? SchoolYearMapper.toResponseDeep(domain.schoolYear)
        : null,
      adviser: domain.adviser
        ? UserMapper.toAdminResponseDeep(domain.adviser)
        : null,
    };
  }
}

