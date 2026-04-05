import {
    ApproveTeacherAcademicBackgroundRequest,
    IApproveTeacherAcademicBackgroundUseCase
} from "./IApproveTeacherAcademicBackgroundUseCase";
import {ITeacherAcademicBackgroundRepository} from "../../../domain/interfaces/ITeacherAcademicBackgroundRepository";
export class ApproveTeacherAcademicBackgroundUseCase implements IApproveTeacherAcademicBackgroundUseCase {
    constructor(
        private readonly teacherAcademicBackgroundRepository: ITeacherAcademicBackgroundRepository,
    ) {}

    async execute(
        request: ApproveTeacherAcademicBackgroundRequest
    ) {
        const data = {
            approvedAt: new Date(),
            isApproved: true,
            approvedById: request.approverId
        }

        return await this.teacherAcademicBackgroundRepository.update(data, request.teacherAcademicBackgroundId);
    }
}