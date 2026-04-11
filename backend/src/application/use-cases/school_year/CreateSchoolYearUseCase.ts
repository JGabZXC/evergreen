import {
  CreateSchoolYearUseCaseRequest,
  ICreateSchoolYearUseCase,
} from "./ICreateSchoolYearUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";
import { SchoolYearResponse } from "../../dto/SchoolYearResponse";
import { SchoolYearMapper } from "../../../infrastructure/mapper/SchoolYearMapper";

export class CreateSchoolYearUseCase implements ICreateSchoolYearUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(
    request: CreateSchoolYearUseCaseRequest,
  ): Promise<SchoolYearResponse> {
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
