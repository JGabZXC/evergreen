import { describe, expect, it } from "vitest";
import { Role, TeacherDetailsType } from "../../../src/generated/prisma/enums";
import { User } from "../../../src/domain/entities/User";
import { UserAddress } from "../../../src/domain/entities/UserAddress";
import { UserProfile } from "../../../src/domain/entities/UserProfile";
import { TeacherAcademicBackground } from "../../../src/domain/entities/TeacherAcademicBackground";
import { Specialization } from "../../../src/domain/entities/Specialization";
import { UserMapper } from "../../../src/infrastructure/mapper/UserMapper";
import { UserAddressMapper } from "../../../src/infrastructure/mapper/UserAddressMapper";
import { UserProfileMapper } from "../../../src/infrastructure/mapper/UserProfileMapper";
import { TeacherAcademicBackgroundMapper } from "../../../src/infrastructure/mapper/TeacherAcademicBackgroundMapper";
import { SpecializationMapper } from "../../../src/infrastructure/mapper/SpecializationMapper";

describe("response mapper shallow/deep split", () => {
  const now = new Date("2026-04-03T01:00:00.000Z");
  const dob = new Date("2000-01-01T00:00:00.000Z");

  const approver = new User(
    "user-approver",
    1001,
    "approver@school.test",
    Role.ADMIN,
    true,
    now,
    now,
    null,
  );

  const userAddress = new UserAddress(
    "address-1",
    "profile-1",
    "123 Main St",
    "Barangay 1",
    "Metro City",
    "Metro Province",
    "Region 1",
    now,
    now,
  );

  it("maps UserProfile shallow without nested relations", () => {
    const profile = new UserProfile(
      "profile-1",
      "user-1",
      "Jane",
      "Q",
      "Doe",
      dob,
      "09123456789",
      now,
      now,
      userAddress,
      [],
      [],
    );

    const result = UserProfileMapper.toResponseShallow(profile);

    expect(result).toEqual({
      firstName: "Jane",
      middleName: "Q",
      lastName: "Doe",
      dateOfBirth: dob.toISOString(),
      contactNumber: "09123456789",
    });
    expect(result).not.toHaveProperty("userAddress");
    expect(result).not.toHaveProperty("teacherAcademicBackground");
    expect(result).not.toHaveProperty("specialization");
  });

  it("maps UserProfile deep with nested relations", () => {
    const profileShallow = new UserProfile(
      "profile-1",
      "user-1",
      "Jane",
      "Q",
      "Doe",
      dob,
      "09123456789",
      now,
      now,
    );

    const teacherAcademicBackground = new TeacherAcademicBackground(
      "teacher-background-1",
      "profile-1",
      "Master of Education",
      "Evergreen University",
      now,
      TeacherDetailsType.MASTERS,
      true,
      now,
      approver.id,
      now,
      now,
      null,
      approver,
    );

    const specialization = new Specialization(
      "specialization-1",
      "profile-1",
      "Mathematics",
      "Secondary education focus",
      true,
      now,
      approver.id,
      now,
      now,
      approver,
    );

    const profile = new UserProfile(
      profileShallow.id,
      profileShallow.userId,
      profileShallow.firstName,
      profileShallow.middleName,
      profileShallow.lastName,
      profileShallow.dateOfBirth,
      profileShallow.contactNumber,
      profileShallow.createdAt,
      profileShallow.updatedAt,
      userAddress,
      [teacherAcademicBackground],
      [specialization],
    );

    const result = UserProfileMapper.toResponseDeep(profile);

    expect(result.userAddress?.homeAddress).toBe("123 Main St");
    expect(result.teacherAcademicBackground?.[0]).toMatchObject({
      degree: "Master of Education",
      approvedBy: {
        id: approver.id,
        accountNumber: approver.accountNumber,
        email: approver.email,
        role: approver.role,
      },
    });
    expect(result.specialization?.[0]).toMatchObject({
      name: "Mathematics",
      approvedBy: {
        id: approver.id,
        accountNumber: approver.accountNumber,
        email: approver.email,
        role: approver.role,
      },
    });
  });

  it("maps TeacherAcademicBackground shallow using UserProfile response shape", () => {
    const profile = new UserProfile(
      "profile-1",
      "user-1",
      "Jane",
      "Q",
      "Doe",
      dob,
      "09123456789",
      now,
      now,
    );

    const background = new TeacherAcademicBackground(
      "teacher-background-1",
      "profile-1",
      "Master of Education",
      "Evergreen University",
      now,
      TeacherDetailsType.MASTERS,
      true,
      now,
      approver.id,
      now,
      now,
      profile,
      approver,
    );

    const result =
      TeacherAcademicBackgroundMapper.toResponseShallow(background);

    expect(result.userProfile).toMatchObject({
      firstName: "Jane",
      middleName: "Q",
      lastName: "Doe",
      dateOfBirth: dob.toISOString(),
      contactNumber: "09123456789",
    });
    expect(result.userProfile).not.toHaveProperty("id");
  });

  it("keeps deep methods aligned with shallow defaults", () => {
    const specialization = new Specialization(
      "specialization-1",
      "profile-1",
      "Mathematics",
      null,
      false,
      null,
      null,
      now,
      now,
      null,
    );

    expect(UserMapper.toResponseDeep(approver)).toEqual(
      UserMapper.toResponseShallow(approver),
    );
    expect(SpecializationMapper.toResponseDeep(specialization)).toEqual(
      SpecializationMapper.toResponseShallow(specialization),
    );
    expect(UserAddressMapper.toResponseDeep(userAddress)).toEqual(
      UserAddressMapper.toResponseShallow(userAddress),
    );
  });
});
