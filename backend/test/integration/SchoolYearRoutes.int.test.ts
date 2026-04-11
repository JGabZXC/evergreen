import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AuthGuard,
  type AuthenticatedRequest,
} from "../../src/interfaces/http/middleware/authGuard";
import { Role, SchoolYearStatus } from "../../src/generated/prisma/enums";
import { SchoolYear } from "../../src/domain/entities/SchoolYear";
import { SchoolYearStatusHistory } from "../../src/domain/entities/SchoolYearStatusHistory";
import { User } from "../../src/domain/entities/User";

describe("SchoolYearRoutes integration", () => {
  let server: Server | null = null;

  const actingUser = new User(
    "de305d54-75b4-431b-adb2-eb6b9e546001",
    1001,
    "registrar@school.local",
    Role.REGISTRAR,
    true,
    new Date("2026-01-01T00:00:00.000Z"),
    new Date("2026-01-01T00:00:00.000Z"),
    null,
  );

  const makeSchoolYear = (status: SchoolYearStatus) =>
    new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      status,
      actingUser.id,
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-02T00:00:00.000Z"),
      actingUser,
      null,
    );

  const buildApp = async () => {
    const { default: schoolYearRoutes } = await import(
      "../../src/interfaces/http/routes/SchoolYearRoutes"
    );

    const app = express();
    app.use(express.json());
    app.use("/api/school-years", schoolYearRoutes);

    app.use(
      (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        void next;

        const statusCode =
          typeof err === "object" &&
          err !== null &&
          "status" in err &&
          typeof (err as { status?: unknown }).status === "number"
            ? (err as { status: number }).status
            : 500;

        const message =
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Unhandled error";

        res.status(statusCode).json({ message });
      },
    );

    return app;
  };

  afterEach(async () => {
    vi.restoreAllMocks();

    if (server) {
      await new Promise<void>((resolve) => {
        server!.close(() => resolve());
      });
      server = null;
    }
  });

  it("returns nested createdBy and status history changedBy for nested=true", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/testdb";

    const statusHistory = new SchoolYearStatusHistory(
      "history-1",
      "school-year-1",
      SchoolYearStatus.UPCOMING,
      SchoolYearStatus.ONGOING,
      "Start of enrollment",
      actingUser.id,
      new Date("2026-06-01T00:00:00.000Z"),
      actingUser,
    );

    const schoolYear = makeSchoolYear(SchoolYearStatus.ONGOING);
    const schoolYearWithHistory = new SchoolYear(
      schoolYear.id,
      schoolYear.startDate,
      schoolYear.endDate,
      schoolYear.gracePeriod,
      schoolYear.status,
      schoolYear.createdById,
      schoolYear.createdAt,
      schoolYear.updatedAt,
      schoolYear.createdBy,
      [statusHistory],
    );

    vi.spyOn(AuthGuard.prototype, "middleware").mockImplementation(
      async (req, _res, next) => {
        (req as AuthenticatedRequest).user = actingUser;
        next();
      },
    );

    const { PrismaSchoolYearRepository } = await import(
      "../../src/infrastructure/repositories/PrismaSchoolYearRepository"
    );

    const getAllSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "getAll")
      .mockResolvedValue({
        data: [schoolYearWithHistory],
        meta: {
          totalItems: 1,
          itemCount: 1,
          totalPages: 1,
          currentPage: 1,
        },
      });

    const app = await buildApp();

    server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(
      `http://127.0.0.1:${port}/api/school-years?nested=true`,
    );
    const body = (await response.json()) as {
      data: Array<{
        createdBy: { id: string; email: string } | null;
        schoolYearStatusHistory: Array<{
          changedBy: { id: string } | null;
        }> | null;
      }>;
    };

    expect(response.status).toBe(200);
    expect(getAllSpy).toHaveBeenCalledWith({}, 1, 10, true);
    expect(body.data[0]?.createdBy?.id).toBe(actingUser.id);
    expect(body.data[0]?.createdBy?.email).toBe("registrar@school.local");
    expect(body.data[0]?.schoolYearStatusHistory?.[0]?.changedBy?.id).toBe(
      actingUser.id,
    );
  });

  it("creates school year and stores authenticated user as createdById", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/testdb";

    vi.spyOn(AuthGuard.prototype, "middleware").mockImplementation(
      async (req, _res, next) => {
        (req as AuthenticatedRequest).user = actingUser;
        next();
      },
    );

    const createdSchoolYear = makeSchoolYear(SchoolYearStatus.UPCOMING);

    const { PrismaSchoolYearRepository } = await import(
      "../../src/infrastructure/repositories/PrismaSchoolYearRepository"
    );

    const findOverlappingSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "findOverlapping")
      .mockResolvedValue(null);

    const createSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "create")
      .mockResolvedValue(createdSchoolYear);

    const app = await buildApp();
    server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(`http://127.0.0.1:${port}/api/school-years`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: "2027-03-31T00:00:00.000Z",
        gracePeriod: 5,
        status: SchoolYearStatus.UPCOMING,
      }),
    });

    expect(response.status).toBe(200);
    expect(createSpy).toHaveBeenCalledWith({
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2027-03-31T00:00:00.000Z"),
      gracePeriod: 5,
      status: SchoolYearStatus.UPCOMING,
      createdById: actingUser.id,
    });
    expect(findOverlappingSpy).toHaveBeenCalledWith(
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
    );
  });

  it("returns 409 when creating an overlapping school year", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/testdb";

    vi.spyOn(AuthGuard.prototype, "middleware").mockImplementation(
      async (req, _res, next) => {
        (req as AuthenticatedRequest).user = actingUser;
        next();
      },
    );

    const conflictingSchoolYear = makeSchoolYear(SchoolYearStatus.ONGOING);

    const { PrismaSchoolYearRepository } = await import(
      "../../src/infrastructure/repositories/PrismaSchoolYearRepository"
    );

    const findOverlappingSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "findOverlapping")
      .mockResolvedValue(conflictingSchoolYear);

    const createSpy = vi.spyOn(PrismaSchoolYearRepository.prototype, "create");

    const app = await buildApp();
    server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(`http://127.0.0.1:${port}/api/school-years`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: "2026-09-25T00:00:00.000Z",
        endDate: "2027-02-01T00:00:00.000Z",
        gracePeriod: 5,
        status: SchoolYearStatus.UPCOMING,
      }),
    });

    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(409);
    expect(body.message).toBe(
      "School year date range overlaps with an existing school year",
    );
    expect(findOverlappingSpy).toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("creates status history on update when status changes", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/testdb";

    vi.spyOn(AuthGuard.prototype, "middleware").mockImplementation(
      async (req, _res, next) => {
        (req as AuthenticatedRequest).user = actingUser;
        next();
      },
    );

    const existingSchoolYear = makeSchoolYear(SchoolYearStatus.UPCOMING);
    const statusHistory = new SchoolYearStatusHistory(
      "de305d54-75b4-431b-adb2-eb6b9e546099",
      existingSchoolYear.id,
      SchoolYearStatus.UPCOMING,
      SchoolYearStatus.ONGOING,
      "Enrollment opened",
      actingUser.id,
      new Date("2026-06-02T00:00:00.000Z"),
      actingUser,
    );

    const { PrismaSchoolYearRepository } = await import(
      "../../src/infrastructure/repositories/PrismaSchoolYearRepository"
    );

    const findByIdSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "findById")
      .mockResolvedValue(existingSchoolYear);
    const findOverlappingSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "findOverlapping")
      .mockResolvedValue(null);
    const updateSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "update")
      .mockResolvedValue(true);
    const createStatusHistorySpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "createStatusHistory")
      .mockResolvedValue(statusHistory);

    const app = await buildApp();
    server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(
      `http://127.0.0.1:${port}/api/school-years/${existingSchoolYear.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: SchoolYearStatus.ONGOING,
          remarks: "Enrollment opened",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(findByIdSpy).toHaveBeenCalledWith(existingSchoolYear.id);
    expect(findOverlappingSpy).toHaveBeenCalledWith(
      existingSchoolYear.startDate,
      existingSchoolYear.endDate,
      existingSchoolYear.id,
    );
    expect(updateSpy).toHaveBeenCalledWith(
      {
        status: SchoolYearStatus.ONGOING,
      },
      existingSchoolYear.id,
    );
    expect(createStatusHistorySpy).toHaveBeenCalledWith({
      schoolYearId: existingSchoolYear.id,
      previousStatus: SchoolYearStatus.UPCOMING,
      newStatus: SchoolYearStatus.ONGOING,
      remarks: "Enrollment opened",
      changedById: actingUser.id,
    });
  });

  it("does not create status history when status is unchanged", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/testdb";

    vi.spyOn(AuthGuard.prototype, "middleware").mockImplementation(
      async (req, _res, next) => {
        (req as AuthenticatedRequest).user = actingUser;
        next();
      },
    );

    const existingSchoolYear = makeSchoolYear(SchoolYearStatus.ONGOING);

    const { PrismaSchoolYearRepository } = await import(
      "../../src/infrastructure/repositories/PrismaSchoolYearRepository"
    );

    vi.spyOn(
      PrismaSchoolYearRepository.prototype,
      "findById",
    ).mockResolvedValue(existingSchoolYear);
    const findOverlappingSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "findOverlapping")
      .mockResolvedValue(null);
    vi.spyOn(PrismaSchoolYearRepository.prototype, "update").mockResolvedValue(
      true,
    );
    const createStatusHistorySpy = vi.spyOn(
      PrismaSchoolYearRepository.prototype,
      "createStatusHistory",
    );

    const app = await buildApp();
    server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(
      `http://127.0.0.1:${port}/api/school-years/${existingSchoolYear.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: SchoolYearStatus.ONGOING,
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(findOverlappingSpy).toHaveBeenCalledWith(
      existingSchoolYear.startDate,
      existingSchoolYear.endDate,
      existingSchoolYear.id,
    );
    expect(createStatusHistorySpy).not.toHaveBeenCalled();
  });

  it("returns 409 when updating to an overlapping school year range", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/testdb";

    vi.spyOn(AuthGuard.prototype, "middleware").mockImplementation(
      async (req, _res, next) => {
        (req as AuthenticatedRequest).user = actingUser;
        next();
      },
    );

    const existingSchoolYear = makeSchoolYear(SchoolYearStatus.UPCOMING);
    const conflictingSchoolYear = new SchoolYear(
      "de305d54-75b4-431b-adb2-eb6b9e546099",
      new Date("2026-08-25T00:00:00.000Z"),
      new Date("2027-03-31T00:00:00.000Z"),
      5,
      SchoolYearStatus.ONGOING,
      actingUser.id,
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-02T00:00:00.000Z"),
      actingUser,
      null,
    );

    const { PrismaSchoolYearRepository } = await import(
      "../../src/infrastructure/repositories/PrismaSchoolYearRepository"
    );

    vi.spyOn(
      PrismaSchoolYearRepository.prototype,
      "findById",
    ).mockResolvedValue(existingSchoolYear);
    const findOverlappingSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "findOverlapping")
      .mockResolvedValue(conflictingSchoolYear);
    const updateSpy = vi.spyOn(PrismaSchoolYearRepository.prototype, "update");

    const app = await buildApp();
    server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(
      `http://127.0.0.1:${port}/api/school-years/${existingSchoolYear.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: "2026-09-25T00:00:00.000Z",
          endDate: "2027-02-01T00:00:00.000Z",
        }),
      },
    );

    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(409);
    expect(body.message).toBe(
      "School year date range overlaps with an existing school year",
    );
    expect(findOverlappingSpy).toHaveBeenCalledWith(
      new Date("2026-09-25T00:00:00.000Z"),
      new Date("2027-02-01T00:00:00.000Z"),
      existingSchoolYear.id,
    );
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("hard deletes school year", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/testdb";

    vi.spyOn(AuthGuard.prototype, "middleware").mockImplementation(
      async (req, _res, next) => {
        (req as AuthenticatedRequest).user = actingUser;
        next();
      },
    );

    const { PrismaSchoolYearRepository } = await import(
      "../../src/infrastructure/repositories/PrismaSchoolYearRepository"
    );

    const deleteSpy = vi
      .spyOn(PrismaSchoolYearRepository.prototype, "delete")
      .mockResolvedValue(true);

    const app = await buildApp();
    server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    const response = await fetch(
      "http://127.0.0.1:"
        .concat(String(port))
        .concat("/api/school-years/de305d54-75b4-431b-adb2-eb6b9e546014"),
      {
        method: "DELETE",
      },
    );

    expect(response.status).toBe(200);
    expect(deleteSpy).toHaveBeenCalledWith(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
    );
  });
});
