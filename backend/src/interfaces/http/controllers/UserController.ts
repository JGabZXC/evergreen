import { Response } from "express";
import { IUpdateUserPasswordUseCase } from "../../../application/use-cases/user/IUpdateUserPasswordUseCase";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { UpdatePasswordRequestWithUserId, UpdatePasswordUserRequest } from "../../../application/dto/UpdatePasswordRequest";
import {BadRequestError} from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/enums/HttpStatus";

export class UserController {
  constructor(
      private readonly updateUserPasswordUseCase: IUpdateUserPasswordUseCase
  ) {
    this.changePassword = this.changePassword.bind(this);
    this.setPassword = this.setPassword.bind(this);
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
