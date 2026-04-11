import {
  IUpdateSchoolYearUseCase,
  UpdateSchoolYearUseCaseRequest,
} from "./IUpdateSchoolYearUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";
import {
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";

export class UpdateSchoolYearUseCase implements IUpdateSchoolYearUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(request: UpdateSchoolYearUseCaseRequest): Promise<boolean> {
    const { id, data, updaterId } = request;

    const existingSchoolYear = await this.schoolYearRepository.findById(id);
    if (!existingSchoolYear) {
      throw new NotFoundError("School year not found");
    }

    const updateData = {
      startDate: data.startDate,
      endDate: data.endDate,
      gracePeriod: data.gracePeriod,
      status: data.status,
    };

    const hasUpdatableField = Object.values(updateData).some(
      (value) => value !== undefined,
    );

    if (!hasUpdatableField) {
      throw new BadRequestError("No valid fields provided for update");
    }

    const result = await this.schoolYearRepository.update(updateData, id);

    const isStatusChanged =
      data.status !== undefined && data.status !== existingSchoolYear.status;

    if (isStatusChanged) {
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
