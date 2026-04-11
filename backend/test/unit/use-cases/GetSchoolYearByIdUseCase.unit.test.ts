import { describe, it, expect, vi } from "vitest";
import { GetSchoolYearByIdUseCase } from "../../../src/application/use-cases/school_year/GetSchoolYearByIdUseCase";
import { SchoolYear } from "../../../src/domain/entities/SchoolYear";
import { User } from "../../../src/domain/entities/User";
import { Role, SchoolYearStatus } from "../../../src/generated/prisma/enums";
import type { ISchoolYearRepository } from "../../../src/domain/interfaces/ISchoolYearRepository";

describe("GetSchoolYearByIdUseCase", () => {
  it("returns deep response when nested=true", async () => {
    const creator = new User(
      "de305d54-75b4-431b-adb2-eb6b9e546001",
      1001,
      "registrar@school.local",
      Role.REGISTRAR,
      true,
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2026-01-01T00:00:00.000Z"),
      null,
    );

    const schoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      SchoolYearStatus.UPCOMING,
      creator.id,
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-01T00:00:00.000Z"),
      creator,
      [],
    );

    const repository: ISchoolYearRepository = {
      getAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(schoolYear),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createStatusHistory: vi.fn(),
    };

    const useCase = new GetSchoolYearByIdUseCase(repository);

    const response = await useCase.execute({
      id: schoolYear.id,
      nested: true,
    });

    expect(repository.findById).toHaveBeenCalledWith(schoolYear.id, true);
    expect("createdBy" in response).toBe(true);
    if ("createdBy" in response) {
      expect(response.createdBy?.id).toBe(creator.id);
    }
  });

  it("throws when school year is not found", async () => {
    const repository: ISchoolYearRepository = {
      getAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createStatusHistory: vi.fn(),
    };

    const useCase = new GetSchoolYearByIdUseCase(repository);

    await expect(
      useCase.execute({
        id: "de305d54-75b4-431b-adb2-eb6b9e546014",
        nested: false,
      }),
    ).rejects.toThrow("School year not found");
  });
});
