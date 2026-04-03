import {IUseCase} from "../../../domain/common/IUseCase";
import {TeacherAcademicBackgroundRequest} from "../../dto/TeacherAcademicBackgroundRequest";

export interface UpdateTeacherAcademicBackgroundRequest {
    id: string;
    data: Partial<TeacherAcademicBackgroundRequest>;
}

export type IUpdateTeacherAcademicBackgroundUseCase = IUseCase<UpdateTeacherAcademicBackgroundRequest, boolean>

