import {Role} from "../../generated/prisma/enums";

export interface UserTokenPayload {
    id: string,
    role: Role;
}