import {TeacherDetailsType} from "../../generated/prisma/enums";
import {PaginatedResult} from "../common/Pagination";
import {TeacherAcademicBackgroundRequest} from "../../application/dto/TeacherAcademicBackgroundRequest";
import {TeacherAcademicBackground} from "../entities/TeacherAcademicBackground";

export interface GetAllTeacherAcademicBackgroundFilter {
    userId?: string;
    type?: TeacherDetailsType;
    isApproved?: boolean;
    approvedBy?: string;
}

export interface ITeacherAcademicBackgroundRepository {
    getAll(
        filter: GetAllTeacherAcademicBackgroundFilter,
        page: number,
        limit: number,
    ): Promise<PaginatedResult<TeacherAcademicBackground>>;
    findAllByUserId(userId: string, page: number, limit: number): Promise<PaginatedResult<TeacherAcademicBackground>>;
    create(data: TeacherAcademicBackgroundRequest, userProfileId: string): Promise<TeacherAcademicBackground>;
    update(data: Partial<TeacherAcademicBackgroundRequest & { isApproved: boolean, approvedAt: string }>, teacherAcademicBackgroundId: string): Promise<boolean>;
    findById(teacherAcademicBackgroundId: string): Promise<TeacherAcademicBackground>;
}