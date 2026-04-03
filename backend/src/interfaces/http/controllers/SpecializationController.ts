import { Response } from "express";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { IUseCase } from "../../../domain/common/IUseCase";
import { GetAllSpecializationRepositoryRequest } from "../../../application/use-cases/specialization/IGetAllSpecializationUseCase";
import { CreateSpecializationRequest } from "../../../application/use-cases/specialization/ICreateSpecializationUseCase";
import { UpdateSpecializationRequest } from "../../../application/use-cases/specialization/IUpdateSpecializationUseCase";
import { SpecializationCreateRequest } from "../../../application/schemas/specializationSchemas";
import { PaginatedResult } from "../../../domain/common/Pagination";
import { SpecializationResponse } from "../../../application/dto/SpecializationResponse";
import { GetAllSpecializationFilter } from '../../../domain/interfaces/ISpecializationRepository';
import { BadRequestError, NotFoundError } from "../middleware/HttpErrors";

export class SpecializationController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getAllSpecializationUseCase: IUseCase<GetAllSpecializationRepositoryRequest, PaginatedResult<SpecializationResponse>>,
    private readonly createSpecializationUseCase: IUseCase<CreateSpecializationRequest, SpecializationResponse>,
    private readonly updateSpecializationUseCase: IUseCase<UpdateSpecializationRequest, SpecializationResponse>,
  ) {
    this.getAllSpecializations = this.getAllSpecializations.bind(this);
    this.createSpecialization = this.createSpecialization.bind(this);
    this.updateSpecialization = this.updateSpecialization.bind(this);
  }

  public async getAllSpecializations(req: AuthenticatedRequest, res: Response) {
    let userId = req.params.userId;

    // Only admins/registrars may request other users' data
    if (userId && !req.user?.isAdminOrRegistrar()) {
      userId = req.user!.id;
    }

    const filter: GetAllSpecializationFilter = {};
    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (!user) throw new NotFoundError("User not found");
      filter.userId = user.id;
    }

    const query = req.query;
    if (query.name) filter.name = String(query.name);
    if (query.isApproved) filter.isApproved = String(query.isApproved).toLowerCase() === "true";
    if (query.approvedBy) filter.approvedById = String(query.approvedBy);

    const page = Number(query.page) || 1;
    let limit = Number(query.limit) || 10;
    if (page < 1 || limit < 1 || !Number.isInteger(page) || !Number.isInteger(limit)) {
      throw new BadRequestError("Pagination parameters must be positive integers.");
    }

    if (limit > 100) limit = 100;

    const request: GetAllSpecializationRepositoryRequest = {
      filter,
      page,
      limit,
    };

    const result = await this.getAllSpecializationUseCase.execute(request);

    return res.status(200).json(result);
  }

  public async createSpecialization(req: AuthenticatedRequest<SpecializationCreateRequest>, res: Response) {
    const data = req.body;

    const request: CreateSpecializationRequest = {
      data,
      creatorId: req.user!.id,
    };

    const response = await this.createSpecializationUseCase.execute(request);
    return res.status(200).json({ data: response });
  }

  public async updateSpecialization(req: AuthenticatedRequest<Partial<SpecializationCreateRequest>>, res: Response) {
    const id = req.params.id;
    if (!id) throw new BadRequestError("id is required");

    const data = req.body;

    const request: UpdateSpecializationRequest = {
      data,
      id,
    };

    const response = await this.updateSpecializationUseCase.execute(request);

    return res.status(200).json({ data: response });
  }
}