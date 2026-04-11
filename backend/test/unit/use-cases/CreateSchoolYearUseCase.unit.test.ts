import { describe, it, expect, vi } from "vitest";
import { CreateSchoolYearUseCase } from "../../../src/application/use-cases/school_year/CreateSchoolYearUseCase";
import { SchoolYear } from "../../../src/domain/entities/SchoolYear";
import { SchoolYearStatus } from "../../../src/generated/prisma/enums";
import type { ISchoolYearRepository } from "../../../src/domain/interfaces/ISchoolYearRepository";

describe("CreateSchoolYearUseCase", () => {
  it("creates school year with creator id from authenticated user", async () => {
    const startDate = new Date("2026-06-01T00:00:00.000Z");
    const endDate = new Date("2027-03-31T00:00:00.000Z");

    const schoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
      startDate,
      endDate,
      5,
      SchoolYearStatus.UPCOMING,
      "de305d54-75b4-431b-adb2-eb6b9e546001",
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-01T00:00:00.000Z"),
      null,
      null,
    );

    const repository: ISchoolYearRepository = {
      getAll: vi.fn(),
      findById: vi.fn(),
      findOverlapping: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(schoolYear),
      update: vi.fn(),
      delete: vi.fn(),
      createStatusHistory: vi.fn(),
    };

    const useCase = new CreateSchoolYearUseCase(repository);

    const response = await useCase.execute({
      data: {
        startDate,
        endDate,
        gracePeriod: 5,
        status: SchoolYearStatus.UPCOMING,
      },
      creatorId: "de305d54-75b4-431b-adb2-eb6b9e546001",
    });

    expect(repository.findOverlapping).toHaveBeenCalledWith(startDate, endDate);

    expect(repository.create).toHaveBeenCalledWith({
      startDate,
      endDate,
      gracePeriod: 5,
      status: SchoolYearStatus.UPCOMING,
      createdById: "de305d54-75b4-431b-adb2-eb6b9e546001",
    });

    expect(response.id).toBe("de305d54-75b4-431b-adb2-eb6b9e546014");
    expect(response.status).toBe(SchoolYearStatus.UPCOMING);
    expect(response.gracePeriod).toBe(5);
  });

  it("throws when school year date range overlaps existing record", async () => {
    const startDate = new Date("2026-08-25T00:00:00.000Z");
    const endDate = new Date("2027-03-31T00:00:00.000Z");

    const conflictingSchoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546099",
      new Date("2026-08-01T00:00:00.000Z"),
      new Date("2027-02-28T00:00:00.000Z"),
      5,
      SchoolYearStatus.ONGOING,
      "de305d54-75b4-431b-adb2-eb6b9e546001",
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-01T00:00:00.000Z"),
      null,
      null,
    );

    const repository: ISchoolYearRepository = {
      getAll: vi.fn(),
      findById: vi.fn(),
      findOverlapping: vi.fn().mockResolvedValue(conflictingSchoolYear),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createStatusHistory: vi.fn(),
    };

    const useCase = new CreateSchoolYearUseCase(repository);

    await expect(
      useCase.execute({
        data: {
          startDate,
          endDate,
          gracePeriod: 5,
          status: SchoolYearStatus.UPCOMING,
        },
        creatorId: "de305d54-75b4-431b-adb2-eb6b9e546001",
      }),
    ).rejects.toThrow(
      "School year date range overlaps with an existing school year",
    );

    expect(repository.create).not.toHaveBeenCalled();
  });
});
