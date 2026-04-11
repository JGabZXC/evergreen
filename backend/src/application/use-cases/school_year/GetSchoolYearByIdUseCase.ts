import {
  GetSchoolYearByIdUseCaseRequest,
  IGetSchoolYearByIdUseCase,
} from "./IGetSchoolYearByIdUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";
import {
  SchoolYearNestedResponse,
  SchoolYearResponse,
} from "../../dto/SchoolYearResponse";
import { SchoolYearMapper } from "../../../infrastructure/mapper/SchoolYearMapper";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";

export class GetSchoolYearByIdUseCase implements IGetSchoolYearByIdUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(
    request: GetSchoolYearByIdUseCaseRequest,
  ): Promise<SchoolYearResponse | SchoolYearNestedResponse> {
    const schoolYear = await this.schoolYearRepository.findById(
      request.id,
      request.nested,
    );

    if (!schoolYear) {
      throw new NotFoundError("School year not found");
    }

    if (request.nested) {
      return SchoolYearMapper.toResponseDeep(schoolYear);
    }

    return SchoolYearMapper.toResponseShallow(schoolYear);
  }
}
