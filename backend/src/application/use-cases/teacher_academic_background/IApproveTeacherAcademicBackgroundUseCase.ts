import {IUseCase} from "../../../domain/common/IUseCase";

export interface ApproveTeacherAcademicBackgroundRequest {
    teacherAcademicBackgroundId: string;
    approverId: string;
}

export type IApproveTeacherAcademicBackgroundUseCase = IUseCase<ApproveTeacherAcademicBackgroundRequest, boolean>