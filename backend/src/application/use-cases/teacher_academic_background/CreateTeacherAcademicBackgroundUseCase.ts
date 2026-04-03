import {
  CreateTeacherAcademicBackgroundRequest,
  ICreateTeacherAcademicBackgroundUseCase,
} from "./ICreateTeacherAcademicBackgroundUseCase";
import { ITeacherAcademicBackgroundRepository } from "../../../domain/interfaces/ITeacherAcademicBackgroundRepository";
import { TeacherAcademicBackgroundResponse } from "../../dto/TeacherAcademicBackgroundResponse";
import { TeacherAcademicBackgroundMapper } from "../../../infrastructure/mapper/TeacherAcademicBackgroundMapper";

export class CreateTeacherAcademicBackgroundUseCase
  implements ICreateTeacherAcademicBackgroundUseCase
{
  constructor(
    public readonly teacherAcademicBackgroundRepository: ITeacherAcademicBackgroundRepository,
  ) {}

  async execute(
    request: CreateTeacherAcademicBackgroundRequest,
  ): Promise<TeacherAcademicBackgroundResponse> {
    const domainTeacherAcademicBackground =
      await this.teacherAcademicBackgroundRepository.create(
        request.data,
        request.creatorId,
      );

    return TeacherAcademicBackgroundMapper.toResponseShallow(
      domainTeacherAcademicBackground,
    );
  }
}
