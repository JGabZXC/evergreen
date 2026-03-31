import { Prisma } from "../../../generated/prisma/client";
import prisma from "../../../infrastructure/database/prisma/db";
import {
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";

type UpdatePayload = Record<string, unknown>;

type AddressInput = {
  homeAddress?: string;
  barangay?: string;
  municipality?: string;
  province?: string;
  region?: string;
};

export class UpdateUserProfileUseCase {
  async execute(userId: string, input: UpdatePayload) {
    const profileInput = this.extractProfileInput(input);
    const addressInput = this.extractAddressInput(input);

    if (
      Object.keys(profileInput).length === 0 &&
      Object.keys(addressInput).length === 0
    ) {
      throw new BadRequestError("No updatable profile fields were provided");
    }

    try {
      const updatedProfile = await prisma.userProfile.update({
        where: { userId },
        data: profileInput,
      });

      if (Object.keys(addressInput).length > 0) {
        await prisma.userAddress.upsert({
          where: { userProfileId: updatedProfile.id },
          update: addressInput,
          create: {
            userProfileId: updatedProfile.id,
            homeAddress: addressInput.homeAddress ?? "",
            barangay: addressInput.barangay ?? "",
            municipality: addressInput.municipality ?? "",
            province: addressInput.province ?? "",
            region: addressInput.region ?? "",
          },
        });
      }

      return prisma.userProfile.findUnique({
        where: { id: updatedProfile.id },
        include: { userAddress: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("User profile not found");
        }
      }

      throw error;
    }
  }

  private extractProfileInput(
    input: UpdatePayload,
  ): Prisma.UserProfileUpdateInput {
    const nested = this.asRecord(input.profile);

    const rawFirstName = nested.firstName ?? input.firstName;
    const rawMiddleName = nested.middleName ?? input.middleName;
    const rawLastName = nested.lastName ?? input.lastName;
    const rawDateOfBirth = nested.dateOfBirth ?? input.dateOfBirth;
    const rawContactNumber =
      nested.contactNumber ??
      nested.phoneNumber ??
      input.contactNumber ??
      input.phoneNumber;

    const profileData: Prisma.UserProfileUpdateInput = {};

    if (typeof rawFirstName === "string") profileData.firstName = rawFirstName;
    if (typeof rawMiddleName === "string")
      profileData.middleName = rawMiddleName;
    if (typeof rawLastName === "string") profileData.lastName = rawLastName;
    if (typeof rawContactNumber === "string")
      profileData.contactNumber = rawContactNumber;

    if (typeof rawDateOfBirth === "string" || rawDateOfBirth instanceof Date) {
      profileData.dateOfBirth = new Date(rawDateOfBirth);
    }

    return profileData;
  }

  private extractAddressInput(input: UpdatePayload): AddressInput {
    const nested = this.asRecord(input.profile);
    const address = this.asRecord(nested.address ?? input.address);

    const addressInput: AddressInput = {};

    if (typeof address.homeAddress === "string")
      addressInput.homeAddress = address.homeAddress;
    if (typeof address.barangay === "string")
      addressInput.barangay = address.barangay;
    if (typeof address.municipality === "string")
      addressInput.municipality = address.municipality;
    if (typeof address.province === "string")
      addressInput.province = address.province;
    if (typeof address.region === "string")
      addressInput.region = address.region;

    return addressInput;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }
}
