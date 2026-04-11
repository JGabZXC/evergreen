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
      findOverlapping: vi.fn().mockResolvedValue(null),
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
    expect(repository.findOverlapping).toHaveBeenCalledWith(
      schoolYear.startDate,
      schoolYear.endDate,
      schoolYear.id,
    );
    expect(repository.update).toHaveBeenCalledWith(
      {
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
      findOverlapping: vi.fn().mockResolvedValue(null),
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
      findOverlapping: vi.fn(),
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

  it("throws when update date range overlaps another school year", async () => {
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

    const conflictingSchoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546099",
      new Date("2026-08-25T00:00:00.000Z"),
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
      findOverlapping: vi.fn().mockResolvedValue(conflictingSchoolYear),
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
          startDate: new Date("2026-09-25T00:00:00.000Z"),
          endDate: new Date("2027-02-01T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow(
      "School year date range overlaps with an existing school year",
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("throws when partial update makes effective dates invalid", async () => {
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
      findOverlapping: vi.fn(),
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
          startDate: new Date("2027-04-01T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow("End date must be after start date");

    expect(repository.findOverlapping).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });
});
