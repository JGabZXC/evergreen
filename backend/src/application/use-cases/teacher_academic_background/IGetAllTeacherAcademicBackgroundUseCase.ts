import {IUseCase} from "../../../domain/common/IUseCase";
import {GetAllTeacherAcademicBackgroundFilter} from "../../../domain/interfaces/ITeacherAcademicBackgroundRepository";
import {TeacherAcademicBackgroundNestedResponse} from "../../dto/TeacherAcademicBackgroundResponse";
import {PaginatedResult} from "../../../domain/common/Pagination";

export interface GetAllTeacherAcademicBackgroundRepositoryRequest {
    filter: GetAllTeacherAcademicBackgroundFilter,
    page: number
    limit: number
}

export type IGetAllTeacherAcademicBackgroundUseCase = IUseCase<GetAllTeacherAcademicBackgroundRepositoryRequest, PaginatedResult<TeacherAcademicBackgroundNestedResponse>>