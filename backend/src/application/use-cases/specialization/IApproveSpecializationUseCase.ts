export interface ApproveSpecializationRequest {
  specializationId: string;
  approverId: string;
}

export interface IApproveSpecializationUseCase {
  execute(request: ApproveSpecializationRequest): Promise<boolean>;
}