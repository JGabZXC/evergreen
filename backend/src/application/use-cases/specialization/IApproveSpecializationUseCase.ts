import {IUseCase} from "../../../domain/common/IUseCase";

export interface ApproveSpecializationRequest {
    specializationId: string;
    approverId: string;
}

export type IApproveSpecializationUseCase = IUseCase<ApproveSpecializationRequest, boolean>