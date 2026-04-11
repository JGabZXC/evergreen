import { SchoolYearStatus } from "../../generated/prisma/enums";
import { BaseEntity } from "../common/BaseEntity";
import { User } from "./User";

export class SchoolYearStatusHistory extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly schoolYearId: string,
    public readonly previousStatus: SchoolYearStatus,
    public readonly newStatus: SchoolYearStatus,
    public readonly remarks: string | null,
    public readonly changedById: string | null,
    public readonly changedAt: Date,

    // NESTED PROPERTIES
    public readonly changedBy: User | null,
  ) {
    super(id, changedAt);
  }
}
