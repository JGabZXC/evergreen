import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { IUseCase } from "../../../domain/common/IUseCase";
import { PaginatedResult } from "../../../domain/common/Pagination";
import {
  SectionNestedResponse,
  SectionResponse,
} from "../../../application/dto/SectionResponse";
import {
  CreateSectionRequest,
  sectionParamsSchema,
  sectionQuerySchema,
  UpdateSectionRequest,
} from "../../../application/schemas/sectionSchemas";
import { GetAllSectionFilter } from "../../../domain/interfaces/ISectionRepository";
import { BadRequestError } from "../middleware/HttpErrors";
import { Section } from "../../../domain/entities/Section";
import { SectionMapper } from "../../../infrastructure/mapper/SectionMapper";
import { HttpStatus } from "../../../domain/enums/HttpStatus";
import { GetAllSectionUseCaseRequest } from "../../../application/use-cases/section/IGetAllSectionUseCase";
import { GetSectionByIdUseCaseRequest } from "../../../application/use-cases/section/IGetSectionByIdUseCase";
import { UpdateSectionUseCaseRequest } from "../../../application/use-cases/section/IUpdateSectionUseCase";
import { DeleteSectionUseCaseRequest } from "../../../application/use-cases/section/IDeleteSectionUseCase";
import { CreateSectionUseCaseRequest } from "../../../application/use-cases/section/ICreateSectionUseCase";

export class SectionController {
  constructor(
    private readonly getAllSectionUseCase: IUseCase<
      GetAllSectionUseCaseRequest,
      PaginatedResult<SectionResponse | SectionNestedResponse>
    >,
    private readonly getSectionByIdUseCase: IUseCase<
      GetSectionByIdUseCaseRequest,
      SectionResponse | SectionNestedResponse
    >,
    private readonly createSectionUseCase: IUseCase<
      CreateSectionUseCaseRequest,
      Section
    >,
    private readonly updateSectionUseCase: IUseCase<
      UpdateSectionUseCaseRequest,
      boolean
    >,
    private readonly deleteSectionUseCase: IUseCase<
      DeleteSectionUseCaseRequest,
      boolean
    >,
  ) {
    this.getAllSections = this.getAllSections.bind(this);
    this.getSectionById = this.getSectionById.bind(this);
    this.createSection = this.createSection.bind(this);
    this.updateSection = this.updateSection.bind(this);
    this.deleteSection = this.deleteSection.bind(this);
  }

  public async getAllSections(req: AuthenticatedRequest, res: Response) {
    const filter: GetAllSectionFilter = {};
    const { data, success, error } = sectionQuerySchema.safeParse(req.query);
    if (!success) throw new BadRequestError("Invalid query parameters", error);

    if (data?.roomId) filter.roomId = data.roomId;
    if (data?.schoolYearId) filter.schoolYearId = data.schoolYearId;
    if (data?.adviserId) filter.adviserId = data.adviserId;
    if (data?.name) filter.name = data.name;

    const page = Number(data?.page) || 1;
    let limit = Number(data?.limit) || 10;

    if (
      page < 1 ||
      limit < 1 ||
      !Number.isInteger(page) ||
      !Number.isInteger(limit)
    ) {
      throw new BadRequestError(
        "Pagination parameters must be positive integers",
      );
    }

    if (limit > 100) limit = 100;

    const nested = data?.nested || false;

    const result = await this.getAllSectionUseCase.execute({
      filter,
      page,
      limit,
      nested,
    });

    if (page !== 1 && page > result.meta.totalPages) {
      throw new BadRequestError("Page number exceeds total pages");
    }

    res.status(HttpStatus.OK).json(result);
  }

  public async getSectionById(req: AuthenticatedRequest, res: Response) {
    const { sectionId } = req.params;
    const query = req.query;

    if (!sectionId) throw new BadRequestError("Section ID is required");

    const request: GetSectionByIdUseCaseRequest = {
      sectionId,
    };

    if (query.nested) {
      request.nested = String(query.nested).toLowerCase() === "true";
    }

    const response = await this.getSectionByIdUseCase.execute(request);

    return res.status(HttpStatus.OK).json({ data: response });
  }

  public async createSection(
    req: AuthenticatedRequest<CreateSectionRequest>,
    res: Response,
  ) {
    const section = await this.createSectionUseCase.execute({
      data: req.body,
    });

    return res.status(HttpStatus.CREATED).json({
      data: SectionMapper.toResponseShallow(section),
    });
  }

  public async updateSection(
    req: AuthenticatedRequest<UpdateSectionRequest>,
    res: Response,
  ) {
    const params = sectionParamsSchema.safeParse(req.params);
    if (!params.success) {
      throw new BadRequestError("Invalid parameters", params.error);
    }

    const { sectionId } = params.data;

    const response = await this.updateSectionUseCase.execute({
      sectionId,
      data: req.body,
    });

    res.status(HttpStatus.OK).json({
      success: response,
    });
  }

  public async deleteSection(req: AuthenticatedRequest, res: Response) {
    const params = sectionParamsSchema.safeParse(req.params);
    if (!params.success) {
      throw new BadRequestError("Invalid parameters", params.error);
    }

    const { sectionId } = params.data;

    const response = await this.deleteSectionUseCase.execute({ sectionId });

    res.status(HttpStatus.OK).json({
      success: response,
    });
  }
}

