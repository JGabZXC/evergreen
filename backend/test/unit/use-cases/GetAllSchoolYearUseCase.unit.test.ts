import { describe, it, expect, vi } from "vitest";
import { GetAllSchoolYearUseCase } from "../../../src/application/use-cases/school_year/GetAllSchoolYearUseCase";
import { SchoolYear } from "../../../src/domain/entities/SchoolYear";
import { SchoolYearStatusHistory } from "../../../src/domain/entities/SchoolYearStatusHistory";
import { User } from "../../../src/domain/entities/User";
import { Role, SchoolYearStatus } from "../../../src/generated/prisma/enums";
import type { ISchoolYearRepository } from "../../../src/domain/interfaces/ISchoolYearRepository";

describe("GetAllSchoolYearUseCase", () => {
  it("maps nested status history and changedBy when nested=true", async () => {
    const approver = new User(
      "user-1",
      1001,
      "admin@school.local",
      Role.ADMIN,
      true,
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2026-01-01T00:00:00.000Z"),
      null,
    );

    const creator = new User(
      "user-2",
      1002,
      "registrar@school.local",
      Role.REGISTRAR,
      true,
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2026-01-01T00:00:00.000Z"),
      null,
    );

    const history = new SchoolYearStatusHistory(
      "history-1",
      "school-year-1",
      SchoolYearStatus.UPCOMING,
      SchoolYearStatus.ONGOING,
      "Opened enrollment",
      "user-1",
      new Date("2026-06-01T00:00:00.000Z"),
      approver,
    );

    const schoolYear = new SchoolYear(
      "school-year-1",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      SchoolYearStatus.ONGOING,
      "user-2",
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-02T00:00:00.000Z"),
      creator,
      [history],
    );

    const repository: ISchoolYearRepository = {
      getAll: vi.fn().mockResolvedValue({
        data: [schoolYear],
        meta: {
          totalItems: 1,
          itemCount: 1,
          totalPages: 1,
          currentPage: 1,
        },
      }),
      findById: vi.fn().mockResolvedValue(schoolYear),
      create: vi.fn().mockResolvedValue(schoolYear),
      update: vi.fn().mockResolvedValue(true),
      delete: vi.fn().mockResolvedValue(true),
      createStatusHistory: vi.fn(async () => history),
    };

    const useCase = new GetAllSchoolYearUseCase(repository);

    const result = await useCase.execute({
      filter: {},
      page: 1,
      limit: 10,
      nested: true,
    });

    const first = result.data[0];
    expect("schoolYearStatusHistory" in first).toBe(true);
    if (!("schoolYearStatusHistory" in first)) {
      throw new Error("Expected nested school year response");
    }

    expect(first.schoolYearStatusHistory).toHaveLength(1);
    expect(first.createdBy?.id).toBe("user-2");
    expect(first.schoolYearStatusHistory?.[0].changedBy?.id).toBe("user-1");
    expect(first.schoolYearStatusHistory?.[0].newStatus).toBe(
      SchoolYearStatus.ONGOING,
    );
  });

  it("returns shallow payload when nested=false", async () => {
    const schoolYear = new SchoolYear(
      "school-year-1",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      SchoolYearStatus.ONGOING,
      null,
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-02T00:00:00.000Z"),
      null,
      null,
    );

    const repository: ISchoolYearRepository = {
      getAll: vi.fn().mockResolvedValue({
        data: [schoolYear],
        meta: {
          totalItems: 1,
          itemCount: 1,
          totalPages: 1,
          currentPage: 1,
        },
      }),
      findById: vi.fn().mockResolvedValue(schoolYear),
      create: vi.fn().mockResolvedValue(schoolYear),
      update: vi.fn().mockResolvedValue(true),
      delete: vi.fn().mockResolvedValue(true),
      createStatusHistory: vi.fn(async () => {
        throw new Error("Not implemented in this test");
      }),
    };

    const useCase = new GetAllSchoolYearUseCase(repository);

    const result = await useCase.execute({
      filter: {},
      page: Number.NaN,
      limit: Number.NaN,
      nested: false,
    });

    expect(repository.getAll).toHaveBeenCalledWith({}, 1, 10, false);
    expect("schoolYearStatusHistory" in result.data[0]).toBe(false);
  });
});
