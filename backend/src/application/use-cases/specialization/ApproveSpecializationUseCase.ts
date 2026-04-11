import {ApproveSpecializationRequest, IApproveSpecializationUseCase} from "./IApproveSpecializationUseCase";
import {ISpecializationRepository} from "../../../domain/interfaces/ISpecializationRepository";

export class ApproveSpecializationUseCase implements IApproveSpecializationUseCase {
    constructor(public specializationRepository: ISpecializationRepository) {}

    async execute(request: ApproveSpecializationRequest): Promise<boolean> {
        const data = {
            isApproved: true,
            approvedAt: new Date(),
            approvedById: request.approverId
        }
        return this.specializationRepository.update(data, request.specializationId);
    }
}