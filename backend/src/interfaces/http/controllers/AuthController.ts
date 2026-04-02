import { Request, Response } from "express";
import { IAuthService } from "../../../domain/interfaces/IAuthService";
import { UserLoginRequest } from "../../../application/dto/UserLoginRequest";
import { BadRequestError, UnauthorizedError } from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/enums/HttpStatus";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { ICreateUserUseCase } from "../../../application/use-cases/user/ICreateUserUseCase";
import {
    UserCreateRequest,
} from "../../../application/schemas/authSchemas";

export class AuthController {
  constructor(
    private readonly authService: IAuthService,
    private readonly createUserUseCase: ICreateUserUseCase,
  ) {
    this.login = this.login.bind(this);
    this.create = this.create.bind(this);
    this.logout = this.logout.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  public async login(req: Request, res: Response) {
    const loginDto = req.body as UserLoginRequest;

    const result = await this.authService.login(
      loginDto.identifier,
      loginDto.password,
    );

    this.setCookie(res, result.access_token, result.refresh_token);
    return res.status(HttpStatus.OK).json({
      user: result.user,
    });
  }

  public async create(req: AuthenticatedRequest<UserCreateRequest>, res: Response) {
    if (!req.user?.isAdminOrRegistrar())
      throw new UnauthorizedError("Unauthorized to create user");

    const createDTO = req.body;
    const user = await this.createUserUseCase.execute({
      data: createDTO,
      creatorId: req.user.id,
    });

    return res.status(HttpStatus.OK).json({
      user,
    });
  }

  public async refreshToken(req: Request, res: Response) {
    const oldRefreshToken = req.cookies.refresh_token;
    if (!oldRefreshToken)
      throw new BadRequestError("Refresh token is required");

    const { access_token, refresh_token, user } =
      await this.authService.refreshToken(oldRefreshToken);

    this.setCookie(res, access_token, refresh_token);

    return res.status(HttpStatus.OK).json({
      user,
    });
  }

  public async logout(req: Request, res: Response) {
    await this.authService.logout(res);

    return res.status(HttpStatus.OK).json({
      message: "Logged out",
    });
  }

  // Validation is handled by request middleware (Zod). Keep controller thin.

  private setCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes,
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    });
  }
}
