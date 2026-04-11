import { BaseTimestamps } from "../common/BaseTimestamps";
import { SchoolYearStatus } from "../../generated/prisma/enums";
import { SchoolYearStatusHistory } from "./SchoolYearStatusHistory";
import { User } from "./User";

export class SchoolYear extends BaseTimestamps {
  constructor(
    public readonly id: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly gracePeriod: number,
    public readonly status: SchoolYearStatus,
    public readonly createdById: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,

    // NESTED PROPERTIES
    public readonly createdBy: User | null,
    public readonly schoolYearStatusHistory: SchoolYearStatusHistory[] | null,
  ) {
    super(id, createdAt, updatedAt);
  }
}
