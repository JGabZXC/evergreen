import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { ICreateSchoolYearUseCase, CreateSchoolYearUseCaseRequest } from "../../../application/use-cases/school_year/ICreateSchoolYearUseCase";
import { IDeleteSchoolYearUseCase, DeleteSchoolYearUseCaseRequest } from "../../../application/use-cases/school_year/IDeleteSchoolYearUseCase";
import { IGetAllSchoolYearUseCase, GetAllSchoolYearRepositoryRequest } from "../../../application/use-cases/school_year/IGetAllSchoolYearUseCase";
import { IGetSchoolYearByIdUseCase, GetSchoolYearByIdUseCaseRequest } from "../../../application/use-cases/school_year/IGetSchoolYearByIdUseCase";
import { IUpdateSchoolYearUseCase, UpdateSchoolYearUseCaseRequest } from "../../../application/use-cases/school_year/IUpdateSchoolYearUseCase";
import {
  SchoolYearCreateRequest,
  SchoolYearUpdateRequest,
} from "../../../application/dto/SchoolYearRequest";
import { GetAllSchoolYearFilter } from "../../../domain/interfaces/ISchoolYearRepository";
import { SchoolYearStatus } from "../../../generated/prisma/enums";
import { BadRequestError } from "../middleware/HttpErrors";

export class SchoolYearController {
  constructor(
    private readonly getAllSchoolYearUseCase: IGetAllSchoolYearUseCase,
    private readonly createSchoolYearUseCase: ICreateSchoolYearUseCase,
    private readonly getSchoolYearByIdUseCase: IGetSchoolYearByIdUseCase,
    private readonly updateSchoolYearUseCase: IUpdateSchoolYearUseCase,
    private readonly deleteSchoolYearUseCase: IDeleteSchoolYearUseCase,
  ) {
    this.getAllSchoolYears = this.getAllSchoolYears.bind(this);
    this.createSchoolYear = this.createSchoolYear.bind(this);
    this.getSchoolYearById = this.getSchoolYearById.bind(this);
    this.updateSchoolYear = this.updateSchoolYear.bind(this);
    this.deleteSchoolYear = this.deleteSchoolYear.bind(this);
  }

  public async createSchoolYear(
    req: AuthenticatedRequest<SchoolYearCreateRequest>,
    res: Response,
  ) {
    const request: CreateSchoolYearUseCaseRequest = {
      data: req.body,
      creatorId: req.user!.id,
    };

    const response = await this.createSchoolYearUseCase.execute(request);
    return res.status(200).json({ data: response });
  }

  public async getSchoolYearById(req: AuthenticatedRequest, res: Response) {
    const id = String(req.params.id || "");
    if (!id) {
      throw new BadRequestError("Missing school year id in params");
    }

    const nested = String(req.query.nested).toLowerCase() === "true";

    const request: GetSchoolYearByIdUseCaseRequest = {
      id,
      nested,
    };

    const response = await this.getSchoolYearByIdUseCase.execute(request);
    return res.status(200).json({ data: response });
  }

  public async getAllSchoolYears(req: AuthenticatedRequest, res: Response) {
    const filter: GetAllSchoolYearFilter = {};
    const query = req.query;

    if (query.status) {
      const status = String(query.status).toUpperCase();
      const isValidStatus = Object.values(SchoolYearStatus).includes(
        status as SchoolYearStatus,
      );

      if (!isValidStatus) {
        throw new BadRequestError("Invalid school year status filter.");
      }

      filter.status = status as SchoolYearStatus;
    }

    if (query.changedBy) {
      filter.changedById = String(query.changedBy);
    }

    const page = Number(query.page) || 1;
    let limit = Number(query.limit) || 10;

    if (
      page < 1 ||
      limit < 1 ||
      !Number.isInteger(page) ||
      !Number.isInteger(limit)
    ) {
      throw new BadRequestError(
        "Pagination parameters must be positive integers.",
      );
    }

    if (limit > 100) {
      limit = 100;
    }

    const nested = String(query.nested).toLowerCase() === "true";

    const request: GetAllSchoolYearRepositoryRequest = {
      filter,
      page,
      limit,
      nested,
    };

    const result = await this.getAllSchoolYearUseCase.execute(request);
    return res.status(200).json(result);
  }

  public async updateSchoolYear(
    req: AuthenticatedRequest<SchoolYearUpdateRequest>,
    res: Response,
  ) {
    const id = String(req.params.id || "");
    if (!id) {
      throw new BadRequestError("Missing school year id in params");
    }

    const request: UpdateSchoolYearUseCaseRequest = {
      id,
      data: req.body,
      updaterId: req.user!.id,
    };

    const response = await this.updateSchoolYearUseCase.execute(request);
    return res.status(200).json({ success: response });
  }

  public async deleteSchoolYear(req: AuthenticatedRequest, res: Response) {
    const id = String(req.params.id || "");
    if (!id) {
      throw new BadRequestError("Missing school year id in params");
    }

    const request: DeleteSchoolYearUseCaseRequest = {
      id,
    };

    const response = await this.deleteSchoolYearUseCase.execute(request);
    return res.status(200).json({ success: response });
  }
}
