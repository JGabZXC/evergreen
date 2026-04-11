import {
  CreateSchoolYearUseCaseRequest,
  ICreateSchoolYearUseCase,
} from "./ICreateSchoolYearUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";
import { SchoolYearResponse } from "../../dto/SchoolYearResponse";
import { SchoolYearMapper } from "../../../infrastructure/mapper/SchoolYearMapper";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class CreateSchoolYearUseCase implements ICreateSchoolYearUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(
    request: CreateSchoolYearUseCaseRequest,
  ): Promise<SchoolYearResponse> {
    const conflictingSchoolYear =
      await this.schoolYearRepository.findOverlapping(
        request.data.startDate,
        request.data.endDate,
      );

    if (conflictingSchoolYear) {
      throw new ConflictError(
        "School year date range overlaps with an existing school year",
      );
    }

    const schoolYear = await this.schoolYearRepository.create({
      startDate: request.data.startDate,
      endDate: request.data.endDate,
      gracePeriod: request.data.gracePeriod,
      status: request.data.status,
      createdById: request.creatorId,
    });

    return SchoolYearMapper.toResponseShallow(schoolYear);
  }
}
