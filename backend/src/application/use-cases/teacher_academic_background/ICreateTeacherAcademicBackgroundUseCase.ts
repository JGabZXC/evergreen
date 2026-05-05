import { TeacherAcademicBackgroundRequest } from "../../dto/TeacherAcademicBackgroundRequest";
import { TeacherAcademicBackgroundResponse } from "../../dto/TeacherAcademicBackgroundResponse";

export interface CreateTeacherAcademicBackgroundRequest {
  data: TeacherAcademicBackgroundRequest;
  creatorId: string;
}

export interface ICreateTeacherAcademicBackgroundUseCase {
  execute(
    request: CreateTeacherAcademicBackgroundRequest
  ): Promise<TeacherAcademicBackgroundResponse>;
}