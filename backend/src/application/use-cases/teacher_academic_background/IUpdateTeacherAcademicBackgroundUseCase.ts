import { TeacherAcademicBackgroundRequest } from "../../dto/TeacherAcademicBackgroundRequest";

export interface UpdateTeacherAcademicBackgroundRequest {
  id: string;
  data: Partial<TeacherAcademicBackgroundRequest>;
}

export interface IUpdateTeacherAcademicBackgroundUseCase {
  execute(
    request: UpdateTeacherAcademicBackgroundRequest
  ): Promise<boolean>;
}