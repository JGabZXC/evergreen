import { Request, Response, NextFunction } from "express";
import {ITokenService} from "../../../domain/interfaces/ITokenService";
import {IUserRepository} from "../../../domain/interfaces/IUserRepository";
import {User} from "../../../domain/entities/User";
import {NotFoundError, UnauthorizedError} from "./HttpErrors";

export interface AuthenticatedRequest<B = unknown> extends Request {
    body: B,
    user?: User;
}

export class AuthGuard {
  constructor(private readonly tokenService: ITokenService,
              private readonly userRepository: IUserRepository) {
    this.middleware = this.middleware.bind(this);
  }

  public async middleware(req: Request, res: Response, next: NextFunction) {
      const token = req.cookies?.access_token;
      if(!token) throw new UnauthorizedError("No token provided");

      const payload = this.tokenService.verifyAccessToken(token);
      if(!payload) throw new UnauthorizedError("Invalid access token");

      const user = await this.userRepository.findById(payload.id);
      if(!user) throw new NotFoundError("User does not exist");

      if(!user.isActive) throw new UnauthorizedError("User does not exist");

      // If the user's role has changed since the token was issued, force re-login
      if (payload.role && user.role !== payload.role) {
        throw new UnauthorizedError("Your role was changed, please login again");
      }

     (req as AuthenticatedRequest).user = user;
     next();
  }
}
