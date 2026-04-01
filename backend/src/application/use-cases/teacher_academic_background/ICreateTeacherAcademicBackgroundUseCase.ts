import {IUseCase} from "../../../domain/common/IUseCase";
import {TeacherAcademicBackgroundRequest} from "../../dto/TeacherAcademicBackgroundRequest";
import {TeacherAcademicBackgroundResponse} from "../../dto/TeacherAcademicBackgroundResponse";

export interface CreateTeacherAcademicBackgroundRequest {
    data: TeacherAcademicBackgroundRequest;
    creatorId: string;
}
export type ICreateTeacherAcademicBackgroundUseCase = IUseCase<CreateTeacherAcademicBackgroundRequest, TeacherAcademicBackgroundResponse>