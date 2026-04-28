import { beforeEach, describe, expect, it, vi } from "vitest";
import { SchoolYear } from "../../../src/domain/entities/SchoolYear";
import { SchoolYearStatus } from "../../../src/generated/prisma/enums";

const { prismaMock, txMock } = vi.hoisted(() => {
  const txMock = {
    schoolYear: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    schoolYearStatusHistory: {
      create: vi.fn(),
    },
  };

  const prismaMock = {
    $transaction: vi.fn(async (callback: (tx: typeof txMock) => Promise<unknown>) => {
      return callback(txMock);
    }),
    schoolYear: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  return { prismaMock, txMock };
});

vi.mock("../../../src/infrastructure/database/prisma/db", () => ({
  default: prismaMock,
}));

import { PrismaSchoolYearRepository } from "../../../src/infrastructure/repositories/PrismaSchoolYearRepository";

describe("PrismaSchoolYearRepository.update", () => {
  const schoolYearId = "de305d54-75b4-431b-adb2-eb6b9e546014";

  const makeSchoolYear = (status: SchoolYearStatus) =>
    new SchoolYear(
      schoolYearId,
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      status,
      null,
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-02T00:00:00.000Z"),
      null,
      null,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates status history when the school year status changes", async () => {
    const existingSchoolYear = makeSchoolYear(SchoolYearStatus.UPCOMING);
    txMock.schoolYear.findUnique.mockResolvedValue(existingSchoolYear);
    txMock.schoolYear.update.mockResolvedValue({});
    txMock.schoolYearStatusHistory.create.mockResolvedValue({});

    const repository = new PrismaSchoolYearRepository();

    const result = await repository.update(
      {
        status: SchoolYearStatus.ONGOING,
        remarks: "Enrollment opened",
        changedById: "de305d54-75b4-431b-adb2-eb6b9e546001",
      },
      schoolYearId,
    );

    expect(result).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.schoolYear.findUnique).not.toHaveBeenCalled();
    expect(txMock.schoolYear.findUnique).toHaveBeenCalledWith({
      where: { id: schoolYearId },
    });
    expect(txMock.schoolYear.update).toHaveBeenCalledWith({
      where: { id: schoolYearId },
      data: {
        status: SchoolYearStatus.ONGOING,
      },
    });
    expect(txMock.schoolYearStatusHistory.create).toHaveBeenCalledWith({
      data: {
        schoolYearId,
        previousStatus: SchoolYearStatus.UPCOMING,
        newStatus: SchoolYearStatus.ONGOING,
        remarks: "Enrollment opened",
        changedById: "de305d54-75b4-431b-adb2-eb6b9e546001",
      },
    });
  });

  it("does not create status history when the status stays the same", async () => {
    const existingSchoolYear = makeSchoolYear(SchoolYearStatus.ONGOING);
    txMock.schoolYear.findUnique.mockResolvedValue(existingSchoolYear);
    txMock.schoolYear.update.mockResolvedValue({});

    const repository = new PrismaSchoolYearRepository();

    const result = await repository.update(
      {
        status: SchoolYearStatus.ONGOING,
        gracePeriod: 10,
        remarks: "No status change",
        changedById: "de305d54-75b4-431b-adb2-eb6b9e546001",
      },
      schoolYearId,
    );

    expect(result).toBe(true);
    expect(txMock.schoolYear.update).toHaveBeenCalledWith({
      where: { id: schoolYearId },
      data: {
        gracePeriod: 10,
        status: SchoolYearStatus.ONGOING,
      },
    });
    expect(txMock.schoolYearStatusHistory.create).not.toHaveBeenCalled();
  });
});

