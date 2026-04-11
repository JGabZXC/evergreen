import { describe, it, expect, vi } from "vitest";
import { CreateSchoolYearUseCase } from "../../../src/application/use-cases/school_year/CreateSchoolYearUseCase";
import { SchoolYear } from "../../../src/domain/entities/SchoolYear";
import { SchoolYearStatus } from "../../../src/generated/prisma/enums";
import type { ISchoolYearRepository } from "../../../src/domain/interfaces/ISchoolYearRepository";

describe("CreateSchoolYearUseCase", () => {
  it("creates school year with creator id from authenticated user", async () => {
    const schoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
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
      create: vi.fn().mockResolvedValue(schoolYear),
      update: vi.fn(),
      delete: vi.fn(),
      createStatusHistory: vi.fn(),
    };

    const useCase = new CreateSchoolYearUseCase(repository);

    const response = await useCase.execute({
      data: {
        startDate: new Date("2026-06-01T00:00:00.000Z"),
        endDate: new Date("2027-03-31T00:00:00.000Z"),
        gracePeriod: 5,
        status: SchoolYearStatus.UPCOMING,
      },
      creatorId: "de305d54-75b4-431b-adb2-eb6b9e546001",
    });

    expect(repository.create).toHaveBeenCalledWith({
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2027-03-31T00:00:00.000Z"),
      gracePeriod: 5,
      status: SchoolYearStatus.UPCOMING,
      createdById: "de305d54-75b4-431b-adb2-eb6b9e546001",
    });

    expect(response.id).toBe("de305d54-75b4-431b-adb2-eb6b9e546014");
    expect(response.status).toBe(SchoolYearStatus.UPCOMING);
    expect(response.gracePeriod).toBe(5);
  });
});
