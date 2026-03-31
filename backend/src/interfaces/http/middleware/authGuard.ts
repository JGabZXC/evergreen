import { Request, Response, NextFunction } from "express";
import {ITokenService} from "../../../domain/interfaces/ITokenService";
import {IUserRepository} from "../../../domain/interfaces/IUserRepository";
import {User} from "../../../domain/entities/User";
import {NotFoundError, UnauthorizedError} from "./HttpErrors";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export class AuthGuard {
  constructor(private readonly tokenService: ITokenService,
              private readonly userRepository: IUserRepository) {
    this.middleware = this.middleware.bind(this);
  }

  public async middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
      const token = req.cookies?.access_token;
      if(!token) throw new UnauthorizedError("No token provided");

      const payload = this.tokenService.verifyAccessToken(token);
      if(!payload) throw new UnauthorizedError("Invalid access token");

      const user = await this.userRepository.findById(payload.id);
      if(!user) throw new NotFoundError("User does not exist");

     req.user = user;
     next();
  }
}
