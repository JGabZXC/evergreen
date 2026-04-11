import { describe, it, expect, vi } from "vitest";
import { UpdateSchoolYearUseCase } from "../../../src/application/use-cases/school_year/UpdateSchoolYearUseCase";
import { SchoolYear } from "../../../src/domain/entities/SchoolYear";
import { SchoolYearStatus } from "../../../src/generated/prisma/enums";
import type { ISchoolYearRepository } from "../../../src/domain/interfaces/ISchoolYearRepository";

describe("UpdateSchoolYearUseCase", () => {
  it("creates status history when status changes", async () => {
    const schoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      SchoolYearStatus.UPCOMING,
      null,
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-01T00:00:00.000Z"),
      null,
      null,
    );

    const repository: ISchoolYearRepository = {
      getAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(schoolYear),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(true),
      delete: vi.fn(),
      createStatusHistory: vi.fn().mockResolvedValue({}),
    };

    const useCase = new UpdateSchoolYearUseCase(repository);

    const result = await useCase.execute({
      id: schoolYear.id,
      updaterId: "de305d54-75b4-431b-adb2-eb6b9e546001",
      data: {
        status: SchoolYearStatus.ONGOING,
        remarks: "Enrollment opened",
      },
    });

    expect(result).toBe(true);
    expect(repository.update).toHaveBeenCalledWith(
      {
        startDate: undefined,
        endDate: undefined,
        gracePeriod: undefined,
        status: SchoolYearStatus.ONGOING,
      },
      schoolYear.id,
    );
    expect(repository.createStatusHistory).toHaveBeenCalledWith({
      schoolYearId: schoolYear.id,
      previousStatus: SchoolYearStatus.UPCOMING,
      newStatus: SchoolYearStatus.ONGOING,
      remarks: "Enrollment opened",
      changedById: "de305d54-75b4-431b-adb2-eb6b9e546001",
    });
  });

  it("does not create status history when status is unchanged", async () => {
    const schoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      SchoolYearStatus.ONGOING,
      null,
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-01T00:00:00.000Z"),
      null,
      null,
    );

    const repository: ISchoolYearRepository = {
      getAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(schoolYear),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(true),
      delete: vi.fn(),
      createStatusHistory: vi.fn(),
    };

    const useCase = new UpdateSchoolYearUseCase(repository);

    const result = await useCase.execute({
      id: schoolYear.id,
      updaterId: "de305d54-75b4-431b-adb2-eb6b9e546001",
      data: {
        status: SchoolYearStatus.ONGOING,
      },
    });

    expect(result).toBe(true);
    expect(repository.createStatusHistory).not.toHaveBeenCalled();
  });

  it("throws when no updatable fields are provided", async () => {
    const schoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      SchoolYearStatus.ONGOING,
      null,
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-01T00:00:00.000Z"),
      null,
      null,
    );

    const repository: ISchoolYearRepository = {
      getAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(schoolYear),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createStatusHistory: vi.fn(),
    };

    const useCase = new UpdateSchoolYearUseCase(repository);

    await expect(
      useCase.execute({
        id: schoolYear.id,
        updaterId: "de305d54-75b4-431b-adb2-eb6b9e546001",
        data: {
          remarks: "Only remarks",
        },
      }),
    ).rejects.toThrow("No valid fields provided for update");
  });
});
