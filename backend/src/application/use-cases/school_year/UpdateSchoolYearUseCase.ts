import {
  IUpdateSchoolYearUseCase,
  UpdateSchoolYearUseCaseRequest,
} from "./IUpdateSchoolYearUseCase";
import { ISchoolYearRepository } from "../../../domain/interfaces/ISchoolYearRepository";
export class UpdateSchoolYearUseCase implements IUpdateSchoolYearUseCase {
  constructor(private readonly schoolYearRepository: ISchoolYearRepository) {}

  async execute(request: UpdateSchoolYearUseCaseRequest): Promise<boolean> {
    const { id, data, updaterId } = request;

    const newData = {
      ...data,
      changedById: updaterId,
    }

    return await this.schoolYearRepository.update(newData, id);
  }
}
