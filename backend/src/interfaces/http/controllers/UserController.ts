import { Response } from "express";
import { IGetAllUserUseCase } from "../../../application/use-cases/user/IGetAllUserUseCase";
import { IUpdateUserPasswordUseCase } from "../../../application/use-cases/user/IUpdateUserPasswordUseCase";
import { BadRequestError } from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/enums/HttpStatus";
import { GetAllUserFilter } from "../../../domain/interfaces/IUserRepository";
import { UserMapper } from "../../../infrastructure/mapper/UserMapper";
import { UserProfileMapper } from "../../../infrastructure/mapper/UserProfileMapper";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { UpdatePasswordRequestWithUserId, UpdatePasswordUserRequest } from "../../../application/dto/UpdatePasswordRequest";

export class UserController {
  constructor(
      private readonly updateUserPasswordUseCase: IUpdateUserPasswordUseCase,
      private readonly getAllUserUseCase: IGetAllUserUseCase,
  ) {
    this.getAllUsers = this.getAllUsers.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.setPassword = this.setPassword.bind(this);
  }

  public async getAllUsers(req: AuthenticatedRequest, res: Response) {
    const filter: GetAllUserFilter = {};
    const query = req.query;

    if (query?.id) filter.id = String(query.id);
    if (query?.email) filter.email = String(query.email);
    if (query?.role) filter.role = String(query.role);
    if (typeof query?.isActive !== "undefined") {
      const val = String(query.isActive).toLowerCase();
      if (val === "true" || val === "false") filter.isActive = val === "true";
    }

    const page = Number(query?.page) || 1;
    let limit = Number(query?.limit) || 10;

    if (
      page < 1 ||
      limit < 1 ||
      !Number.isInteger(page) ||
      !Number.isInteger(limit)
    ) {
      throw new BadRequestError("Pagination parameters must be positive integers");
    }

    if (limit > 100) limit = 100;

    const result = await this.getAllUserUseCase.execute({ filter, page, limit });

    if (page !== 1 && page > result.meta.totalPages) throw new BadRequestError("Page number exceeds total pages");

    const data = result.data.map((u) => ({
      user: UserMapper.toAdminResponseShallow(u),
      userProfile: u.userProfile ? UserProfileMapper.toResponseShallow(u.userProfile) : null,
    }));

    return res.status(HttpStatus.OK).json({ data, meta: result.meta });
  }

  public async changePassword(req: AuthenticatedRequest<UpdatePasswordUserRequest>, res: Response) {
    /*
    * This is for Authenticated users to change their own password, so currentPassword is required and will be verified in use-case
    */
    const body = req.body;

    const result = await this.updateUserPasswordUseCase.execute({
      password: body.password,
      confirmPassword: body.confirmPassword,
      userId: req.user!.id,
      currentPassword: body.currentPassword,
    });

    return res.status(HttpStatus.OK).json({ user: result });
  }

  public async setPassword(req: AuthenticatedRequest<UpdatePasswordRequestWithUserId>, res: Response) {
    /*
    * This route is for Role.ADMIN only
    */
    const body = req.body;
    if (!body.userId) throw new BadRequestError("userId is required");

    const result = await this.updateUserPasswordUseCase.execute({
      password: body.password,
      confirmPassword: body.confirmPassword,
      userId: body.userId,
    });

    return res.status(HttpStatus.OK).json({ user: result });
  }
}
