import {UserAddress as PrismaUserAddress} from "../../generated/prisma/client";
import {UserAddress} from "../../domain/entities/UserAddress";
import {UserAddressResponse} from "../../application/dto/UserAddressResponse";

export class UserAddressMapper {
    static toDomain(raw: PrismaUserAddress) {
        return new UserAddress(
            raw.id,
            raw.userProfileId,
            raw.homeAddress,
            raw.barangay,
            raw.municipality,
            raw.province,
            raw.region,
            raw.createdAt,
            raw.updatedAt
        );
    }

    static toResponse(domain: UserAddress): UserAddressResponse {
        return {
            homeAddress: domain.homeAddress,
            barangay: domain.barangay,
            municipality: domain.municipality,
            province: domain.province,
            region: domain.region,
        }
    }
}