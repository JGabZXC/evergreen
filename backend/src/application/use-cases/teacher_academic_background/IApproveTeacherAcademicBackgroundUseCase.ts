export interface ApproveTeacherAcademicBackgroundRequest {
  teacherAcademicBackgroundId: string;
  approverId: string;
}

export interface IApproveTeacherAcademicBackgroundUseCase {
  execute(
    request: ApproveTeacherAcademicBackgroundRequest
  ): Promise<boolean>;
}