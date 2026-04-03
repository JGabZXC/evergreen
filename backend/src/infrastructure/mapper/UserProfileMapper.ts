import {UserProfile as PrismaUserProfile, Specialization as PrismaSpecialization, User as PrismaUser, TeacherAcademicBackground as PrismaTeacherAcademicBackground, UserAddress as PrismaUserAddress} from "../../generated/prisma/client"
import {UserProfile} from "../../domain/entities/UserProfile";
import {UserAddressMapper} from "./UserAddressMapper";
import {TeacherAcademicBackgroundMapper} from "./TeacherAcademicBackgroundMapper";
import {SpecializationMapper} from "./SpecializationMapper";

interface WithReverseRelation extends PrismaUserProfile {
    userAddress: PrismaUserAddress | null,
    teacherAcademicBackground: (PrismaTeacherAcademicBackground & { approvedBy: PrismaUser | null })[] | null,
    specialization: (PrismaSpecialization & {
        approvedBy: PrismaUser | null})[] | null,
}

export class UserProfileMapper {
    static toDomain(raw: WithReverseRelation) {
        return new UserProfile(
            raw.id,
            raw.userId,
            raw.firstName,
            raw.middleName,
            raw.lastName,
            raw.dateOfBirth,
            raw.contactNumber,
            raw.createdAt,
            raw.updatedAt,

            // NESTED PROPERTIES
            raw.userAddress ? UserAddressMapper.toDomain(raw.userAddress) : null,
            raw.teacherAcademicBackground ? raw.teacherAcademicBackground.map((background) => TeacherAcademicBackgroundMapper.toDomain(background)) : null,
            raw.specialization ? raw.specialization.map((specialization) => SpecializationMapper.toDomain(specialization)) : null,
        )
    }

    static toResponse(domain: UserProfile) {
        return {
            firstName: domain.firstName,
            middleName: domain.middleName,
            lastName: domain.lastName,
            dateOfBirth: domain.dateOfBirth,
            contactNumber: domain.contactNumber,

            // REVERSE RELATION
            userAddress: domain.userAddress ? UserAddressMapper.toResponse(domain.userAddress) : null,
            teacherAcademicBackground: domain.teacherAcademicBackground ? domain.teacherAcademicBackground.map((background) => TeacherAcademicBackgroundMapper.toResponse(background)) : null,
            specialization: domain.specialization ? domain.specialization.map((specialization) => SpecializationMapper.toResponse(specialization)) : null,

        }
    }
}