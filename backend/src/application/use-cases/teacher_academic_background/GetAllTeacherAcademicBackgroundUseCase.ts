import {
  GetAllTeacherAcademicBackgroundFilter,
  ITeacherAcademicBackgroundRepository,
} from "../../../domain/interfaces/ITeacherAcademicBackgroundRepository";
import { IGetAllTeacherAcademicBackgroundUseCase, GetAllTeacherAcademicBackgroundRepositoryRequest } from "./IGetAllTeacherAcademicBackgroundUseCase";
import { PaginatedResult } from "../../../domain/common/Pagination";
import { TeacherAcademicBackgroundNestedResponse } from "../../dto/TeacherAcademicBackgroundResponse";
import { TeacherAcademicBackgroundMapper } from "../../../infrastructure/mapper/TeacherAcademicBackgroundMapper";

export class GetAllTeacherAcademicBackgroundUseCase implements IGetAllTeacherAcademicBackgroundUseCase {
  constructor(public readonly teacherAcademicBackgroundRepository: ITeacherAcademicBackgroundRepository) {}

  async execute(
    request: GetAllTeacherAcademicBackgroundRepositoryRequest,
  ): Promise<PaginatedResult<TeacherAcademicBackgroundNestedResponse>> {
    const filter: GetAllTeacherAcademicBackgroundFilter = request.filter ?? {};
    const page = Number.isNaN(Number(request.page)) ? 1 : Math.max(1, Number(request.page));
    const limit = Number.isNaN(Number(request.limit)) ? 10 : Math.max(1, Number(request.limit));

    const result = await this.teacherAcademicBackgroundRepository.getAll(filter, page, limit);

    const data = result.data.map(TeacherAcademicBackgroundMapper.toResponse);

    return {
      data,
      meta: result.meta,
    };
  }
}