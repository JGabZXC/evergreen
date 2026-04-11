import {
  DeleteSchoolYearUseCaseRequest,
  IDeleteSchoolYearUseCase,
} from "./IDeleteSchoolYearUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";

export class DeleteSchoolYearUseCase implements IDeleteSchoolYearUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(request: DeleteSchoolYearUseCaseRequest): Promise<boolean> {
    return this.schoolYearRepository.delete(request.id);
  }
}
