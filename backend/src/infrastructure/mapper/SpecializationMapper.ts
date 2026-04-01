import {Specialization as PrismaSpecialization} from "../../generated/prisma/client";
import {Specialization} from "../../domain/entities/Specialization";
import {SpecializationResponse} from "../../application/dto/SpecializationResponse";

export class SpecializationMapper {
    static toDomain(raw: PrismaSpecialization) {
        return new Specialization(
            raw.id,
            raw.userProfileId,
            raw.name,
            raw.description,
            raw.isApproved,
            raw.approvedAt,
            raw.approvedById,
            raw.createdAt,
            raw.updatedAt
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
        }
    }
}