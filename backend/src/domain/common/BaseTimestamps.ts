import { BaseEntity } from "./BaseEntity";

export abstract class BaseTimestamps extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super(id, createdAt);
  }
}
