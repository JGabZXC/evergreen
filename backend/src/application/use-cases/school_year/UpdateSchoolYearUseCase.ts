import {
  IUpdateSchoolYearUseCase,
  UpdateSchoolYearUseCaseRequest,
} from "./IUpdateSchoolYearUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";
import {
  UpdateSchoolYearRepositoryRequest,
} from "../../../domain/interfaces/ISchoolYearRepository";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";

export class UpdateSchoolYearUseCase implements IUpdateSchoolYearUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(request: UpdateSchoolYearUseCaseRequest): Promise<boolean> {
    const { id, data, updaterId } = request;

    const schoolYear = await this.schoolYearRepository.findById(id);
    if (!schoolYear) {
      throw new NotFoundError("School year not found");
    }

    const updateData: UpdateSchoolYearRepositoryRequest = {};

    if (data.startDate) {
      updateData.startDate = data.startDate;
    }

    if (data.endDate) {
      updateData.endDate = data.endDate;
    }

    if (data.gracePeriod !== undefined) {
      updateData.gracePeriod = data.gracePeriod;
    }

    if (data.status) {
      updateData.status = data.status;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError("No valid fields provided for update");
    }

    const effectiveStartDate = updateData.startDate ?? schoolYear.startDate;
    const effectiveEndDate = updateData.endDate ?? schoolYear.endDate;

    if (effectiveStartDate >= effectiveEndDate) {
      throw new BadRequestError("End date must be after start date");
    }

    const conflictingSchoolYear =
      await this.schoolYearRepository.findOverlapping(
        effectiveStartDate,
        effectiveEndDate,
        schoolYear.id,
      );

    if (conflictingSchoolYear) {
      throw new ConflictError(
        "School year date range overlaps with an existing school year",
      );
    }

    const updated = await this.schoolYearRepository.update(updateData, id);

    if (updated && data.status && data.status !== schoolYear.status) {
      await this.schoolYearRepository.createStatusHistory({
        schoolYearId: schoolYear.id,
        previousStatus: schoolYear.status,
        newStatus: data.status,
        remarks: data.remarks,
        changedById: updaterId,
      });
    }

    return updated;
  }
}
