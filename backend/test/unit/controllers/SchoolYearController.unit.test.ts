import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";
import { SchoolYearController } from "../../../src/interfaces/http/controllers/SchoolYearController";
import type { AuthenticatedRequest } from "../../../src/interfaces/http/middleware/authGuard";
import { SchoolYearStatus } from "../../../src/generated/prisma/enums";
import type { IUseCase } from "../../../src/domain/common/IUseCase";
import type { GetAllSchoolYearRepositoryRequest } from "../../../src/application/use-cases/school_year/IGetAllSchoolYearUseCase";
import type { PaginatedResult } from "../../../src/domain/common/Pagination";
import type {
  SchoolYearNestedResponse,
  SchoolYearResponse,
} from "../../../src/application/dto/SchoolYearResponse";
import type {
  SchoolYearCreateRequest,
  SchoolYearUpdateRequest,
} from "../../../src/application/dto/SchoolYearRequest";

describe("SchoolYearController", () => {
  const createController = () => {
    const getAllExecute = vi.fn();
    const createExecute = vi.fn();
    const getByIdExecute = vi.fn();
    const updateExecute = vi.fn();
    const deleteExecute = vi.fn();

    const getAllSchoolYearUseCase: IUseCase<
      GetAllSchoolYearRepositoryRequest,
      PaginatedResult<SchoolYearResponse | SchoolYearNestedResponse>
    > = { execute: getAllExecute };

    const controller = new SchoolYearController(
      getAllSchoolYearUseCase,
      { execute: createExecute },
      { execute: getByIdExecute },
      { execute: updateExecute },
      { execute: deleteExecute },
    );

    return {
      controller,
      getAllExecute,
      createExecute,
      getByIdExecute,
      updateExecute,
      deleteExecute,
    };
  };

  it("uses default pagination limit 10 with nested=false", async () => {
    const fakeResult = {
      data: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        totalPages: 0,
        currentPage: 1,
      },
    };

    const { controller, getAllExecute } = createController();
    getAllExecute.mockResolvedValue(fakeResult);

    const req = {
      query: {},
      params: {},
    } as unknown as AuthenticatedRequest;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    await controller.getAllSchoolYears(req, res);

    expect(getAllExecute).toHaveBeenCalledWith({
      filter: {},
      page: 1,
      limit: 10,
      nested: false,
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(fakeResult);
  });

  it("parses nested=true, status and changedBy filters, and caps limit to 100", async () => {
    const { controller, getAllExecute } = createController();
    getAllExecute.mockResolvedValue({
      data: [],
      meta: { totalItems: 0, itemCount: 0, totalPages: 0, currentPage: 2 },
    });

    const req = {
      query: {
        nested: "true",
        status: "ongoing",
        changedBy: "user-1",
        page: "2",
        limit: "1000",
      },
      params: {},
    } as unknown as AuthenticatedRequest;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    await controller.getAllSchoolYears(req, res);

    expect(getAllExecute).toHaveBeenCalledWith({
      filter: {
        status: SchoolYearStatus.ONGOING,
        changedById: "user-1",
      },
      page: 2,
      limit: 100,
      nested: true,
    });
  });

  it("throws for invalid school year status", async () => {
    const { controller } = createController();

    const req = {
      query: { status: "invalid" },
      params: {},
    } as unknown as AuthenticatedRequest;

    const res = { status: vi.fn() } as unknown as Response;

    await expect(controller.getAllSchoolYears(req, res)).rejects.toThrow(
      "Invalid school year status filter.",
    );
  });

  it("creates school year with authenticated user id as creator", async () => {
    const { controller, createExecute } = createController();
    createExecute.mockResolvedValue({
      id: "de305d54-75b4-431b-adb2-eb6b9e546014",
      startDate: "2026-06-01T00:00:00.000Z",
      endDate: "2027-03-31T00:00:00.000Z",
      gracePeriod: 5,
      status: SchoolYearStatus.UPCOMING,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
    });

    const req = {
      body: {
        startDate: new Date("2026-06-01T00:00:00.000Z"),
        endDate: new Date("2027-03-31T00:00:00.000Z"),
        gracePeriod: 5,
        status: SchoolYearStatus.UPCOMING,
      },
      user: { id: "de305d54-75b4-431b-adb2-eb6b9e546001" },
      params: {},
      query: {},
    } as unknown as AuthenticatedRequest<SchoolYearCreateRequest>;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    await controller.createSchoolYear(req, res);

    expect(createExecute).toHaveBeenCalledWith({
      data: req.body,
      creatorId: "de305d54-75b4-431b-adb2-eb6b9e546001",
    });
    expect(status).toHaveBeenCalledWith(200);
  });

  it("gets school year by id and parses nested query", async () => {
    const { controller, getByIdExecute } = createController();
    getByIdExecute.mockResolvedValue({
      id: "de305d54-75b4-431b-adb2-eb6b9e546014",
      startDate: "2026-06-01T00:00:00.000Z",
      endDate: "2027-03-31T00:00:00.000Z",
      gracePeriod: 5,
      status: SchoolYearStatus.UPCOMING,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
      createdBy: null,
      schoolYearStatusHistory: [],
    });

    const req = {
      params: { id: "de305d54-75b4-431b-adb2-eb6b9e546014" },
      query: { nested: "true" },
    } as unknown as AuthenticatedRequest;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    await controller.getSchoolYearById(req, res);

    expect(getByIdExecute).toHaveBeenCalledWith({
      id: "de305d54-75b4-431b-adb2-eb6b9e546014",
      nested: true,
    });
    expect(status).toHaveBeenCalledWith(200);
  });

  it("updates school year with updater id from authenticated user", async () => {
    const { controller, updateExecute } = createController();
    updateExecute.mockResolvedValue(true);

    const req = {
      params: { id: "de305d54-75b4-431b-adb2-eb6b9e546014" },
      body: {
        status: SchoolYearStatus.ONGOING,
        remarks: "Enrollment opened",
      },
      user: { id: "de305d54-75b4-431b-adb2-eb6b9e546001" },
      query: {},
    } as unknown as AuthenticatedRequest<SchoolYearUpdateRequest>;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    await controller.updateSchoolYear(req, res);

    expect(updateExecute).toHaveBeenCalledWith({
      id: "de305d54-75b4-431b-adb2-eb6b9e546014",
      data: {
        status: SchoolYearStatus.ONGOING,
        remarks: "Enrollment opened",
      },
      updaterId: "de305d54-75b4-431b-adb2-eb6b9e546001",
    });
    expect(status).toHaveBeenCalledWith(200);
  });

  it("deletes school year by id", async () => {
    const { controller, deleteExecute } = createController();
    deleteExecute.mockResolvedValue(true);

    const req = {
      params: { id: "de305d54-75b4-431b-adb2-eb6b9e546014" },
      query: {},
    } as unknown as AuthenticatedRequest;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    await controller.deleteSchoolYear(req, res);

    expect(deleteExecute).toHaveBeenCalledWith({
      id: "de305d54-75b4-431b-adb2-eb6b9e546014",
    });
    expect(status).toHaveBeenCalledWith(200);
  });
});
