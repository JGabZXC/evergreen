export interface DeleteSchoolYearUseCaseRequest {
  id: string;
}

export interface IDeleteSchoolYearUseCase {
  execute(request: DeleteSchoolYearUseCaseRequest): Promise<boolean>;
}