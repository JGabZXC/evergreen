import { Response } from "express";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AuthenticatedRequest } from "../middleware/authGuard";
import type { IGetAllSpecializationUseCase, GetAllSpecializationRepositoryRequest } from "../../../application/use-cases/specialization/IGetAllSpecializationUseCase";
import type { ICreateSpecializationUseCase, CreateSpecializationRequest } from "../../../application/use-cases/specialization/ICreateSpecializationUseCase";
import type { IUpdateSpecializationUseCase, UpdateSpecializationRequest } from "../../../application/use-cases/specialization/IUpdateSpecializationUseCase";
import type { IApproveSpecializationUseCase } from "../../../application/use-cases/specialization/IApproveSpecializationUseCase";
import { SpecializationCreateRequest } from "../../../application/schemas/specializationSchemas";
import {
  GetAllSpecializationFilter,
  ISpecializationRepository
} from '../../../domain/interfaces/ISpecializationRepository';
import { BadRequestError, NotFoundError } from "../middleware/HttpErrors";

export class SpecializationController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly specializationRepo: ISpecializationRepository,
    private readonly getAllSpecializationUseCase: IGetAllSpecializationUseCase,
    private readonly createSpecializationUseCase: ICreateSpecializationUseCase,
    private readonly updateSpecializationUseCase: IUpdateSpecializationUseCase,
    private readonly approveSpecializationUseCase: IApproveSpecializationUseCase
  ) {
    this.getAllSpecializations = this.getAllSpecializations.bind(this);
    this.createSpecialization = this.createSpecialization.bind(this);
    this.updateSpecialization = this.updateSpecialization.bind(this);
    this.approveSpecialization = this.approveSpecialization.bind(this);
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

  public async approveSpecialization(req: AuthenticatedRequest, res: Response) {
    const specializationId = String(req.params.id);

    if(!(await this.specializationRepo.findById(specializationId))) throw new NotFoundError("Specialization not found");

    const result = await this.approveSpecializationUseCase.execute({specializationId, approverId: req.user!.id});

    return res.status(200).json({ data: result });
  }
}