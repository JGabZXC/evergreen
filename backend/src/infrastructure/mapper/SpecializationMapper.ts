import {Specialization as PrismaSpecialization, User as PrismaUser} from "../../generated/prisma/client";
import {Specialization} from "../../domain/entities/Specialization";
import {SpecializationResponse} from "../../application/dto/SpecializationResponse";
import {UserMapper} from "./UserMapper";

interface WithRelation extends PrismaSpecialization {
    approvedBy: PrismaUser | null,
}

export class SpecializationMapper {
    static toDomain(raw: WithRelation) {
        return new Specialization(
            raw.id,
            raw.userProfileId,
            raw.name,
            raw.description,
            raw.isApproved,
            raw.approvedAt,
            raw.approvedById,
            raw.createdAt,
            raw.updatedAt,

            // NESTED PROPERTIES
            raw.approvedBy ? UserMapper.toDomain(raw.approvedBy) : null,
        )
    }

    static toResponse(domain: Specialization): SpecializationResponse {
        return {
            name: domain.name,
            description: domain.description,
            isApproved: domain.isApproved,
            approvedAt: domain.approvedAt?.toISOString() || null,
            approvedById: domain.approvedById,
            createdAt: domain.createdAt.toISOString(),

            // NESTED PROPERTIES
            approvedBy: domain.approvedBy ? UserMapper.toResponse(domain.approvedBy) : null,
        }
    }
}