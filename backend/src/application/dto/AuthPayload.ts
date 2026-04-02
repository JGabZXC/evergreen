import {UserTokenPayload} from "./UserTokenPayload";

export interface AuthPayload extends UserTokenPayload {
  iat?: number;
  exp?: number;
}
