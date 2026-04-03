import { Role } from "../../generated/prisma/enums";
import { BaseTimestamps } from "../common/BaseTimestamps";
import {UserProfile} from "./UserProfile";

export class User extends BaseTimestamps {
  constructor(
    public readonly id: string,
    public readonly accountNumber: number,
    public readonly email: string,
    public readonly role: Role,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,

    public readonly userProfile?: UserProfile | null,
  ) {
    super(id, createdAt, updatedAt);
  }

  public canAccessAdminPanel(): boolean {
    return this.role === Role.ADMIN || this.role === Role.PRINCIPAL;
  }

  public isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  public isRegistrar(): boolean {
    return this.role === Role.REGISTRAR;
  }

  public isAdminOrRegistrar(): boolean {
    return this.isAdmin() || this.isRegistrar();
  }
}
