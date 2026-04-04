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
            approvedAt: new Date().toISOString(),
            isApproved: true,
            // Prisma expects the foreign key scalar field `approvedById` when updating
            // the relation by id. Passing `approvedBy` (relation object) as a string
            // causes a runtime error. Use the scalar FK here.
            approvedById: request.approverId
        }

        return await this.teacherAcademicBackgroundRepository.update(data, request.teacherAcademicBackgroundId);
    }
}