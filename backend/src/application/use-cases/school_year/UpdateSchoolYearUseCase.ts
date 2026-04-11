import {
  IUpdateSchoolYearUseCase,
  UpdateSchoolYearUseCaseRequest,
} from "./IUpdateSchoolYearUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import type { UpdateSchoolYearRepositoryRequest } from "../../../domain/interfaces/ISchoolYearRepository";

export class UpdateSchoolYearUseCase implements IUpdateSchoolYearUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(request: UpdateSchoolYearUseCaseRequest): Promise<boolean> {
    const { id, data, updaterId } = request;

    const existingSchoolYear = await this.schoolYearRepository.findById(id);
    if (!existingSchoolYear) {
      throw new NotFoundError("School year not found");
    }

    const updateData: UpdateSchoolYearRepositoryRequest = {};

    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate;
    }

    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate;
    }

    if (data.gracePeriod !== undefined) {
      updateData.gracePeriod = data.gracePeriod;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const hasUpdatableField = Object.keys(updateData).length > 0;

    if (!hasUpdatableField) {
      throw new BadRequestError("No valid fields provided for update");
    }

    const effectiveStartDate = data.startDate ?? existingSchoolYear.startDate;
    const effectiveEndDate = data.endDate ?? existingSchoolYear.endDate;

    if (effectiveStartDate >= effectiveEndDate) {
      throw new BadRequestError("End date must be after start date");
    }

    const conflictingSchoolYear =
      await this.schoolYearRepository.findOverlapping(
        effectiveStartDate,
        effectiveEndDate,
        id,
      );

    if (conflictingSchoolYear) {
      throw new ConflictError(
        "School year date range overlaps with an existing school year",
      );
    }

    const result = await this.schoolYearRepository.update(updateData, id);

    if (
      data.status !== undefined &&
      data.status !== existingSchoolYear.status
    ) {
      await this.schoolYearRepository.createStatusHistory({
        schoolYearId: id,
        previousStatus: existingSchoolYear.status,
        newStatus: data.status,
        remarks: data.remarks ?? null,
        changedById: updaterId,
      });
    }

    return result;
  }
}
