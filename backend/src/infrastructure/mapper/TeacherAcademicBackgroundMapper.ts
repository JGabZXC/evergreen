import {TeacherAcademicBackground as PrismaTeacherAcademicBackground, User as PrismaUser} from "../../generated/prisma/client";
import {TeacherAcademicBackground} from "../../domain/entities/TeacherAcademicBackground";
import {UserMapper} from "./UserMapper";
import {
    TeacherAcademicBackgroundAdminResponse,
    TeacherAcademicBackgroundNestedResponse
} from "../../application/dto/TeacherAcademicBackgroundResponse";

interface WithRelations extends PrismaTeacherAcademicBackground {
    approvedBy: PrismaUser | null
}


export class TeacherAcademicBackgroundMapper {
    static toDomain(raw: WithRelations) {
        return new TeacherAcademicBackground(
            raw.id,
            raw.userProfileId,
            raw.degree,
            raw.institution,
            raw.completedAt,
            raw.type,
            raw.isApproved,
            raw.approvedAt,
            raw.approvedById,
            raw.createdAt,
            raw.updatedAt,

            // NESTED PROPERTIES
            raw.approvedBy ? UserMapper.toDomain(raw.approvedBy) : null,
        )
    }

    static toResponse (domain: TeacherAcademicBackground): TeacherAcademicBackgroundNestedResponse {
        return {
            degree: domain.degree,
            institution: domain.institution,
            completedAt: domain.completedAt.toISOString(),
            type: domain.type,
            isApproved: domain.isApproved,
            approvedAt: domain.approvedAt?.toISOString() || null,
            approvedById: domain.approvedById,
            createdAt: domain.createdAt.toISOString(),

            // NESTED PROPERTIES
            approvedBy: domain.approvedBy ? UserMapper.toResponse(domain.approvedBy) : null,
        }
    }

    static toAdminResponse(domain: TeacherAcademicBackground): TeacherAcademicBackgroundAdminResponse {
        return {
            ...this.toResponse(domain),
            id: domain.id,
            userProfileId: domain.userProfileId,
            updatedAt: domain.updatedAt.toISOString(),
        }
    }
}