export interface DeleteSectionUseCaseRequest {
  sectionId: string;
}

export interface IDeleteSectionUseCase {
  execute(request: DeleteSectionUseCaseRequest): Promise<boolean>;
}