import {UserTokenPayload} from "../../application/dto/UserTokenPayload";

export interface AuthPayload extends UserTokenPayload {
  iat?: number;
  exp?: number;
}
