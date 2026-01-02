import { SchoolYearModel } from "../../../infrastructure/database/SchoolYearModel";
import { BaseSchoolYear } from "../../../domain/SchoolYear";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";

export class UpdateSchoolYearUseCase {
  async execute(id: string, updates: Partial<BaseSchoolYear>) {
    const schoolYear = await SchoolYearModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!schoolYear) {
      throw new NotFoundError("School Year not found");
    }
    return schoolYear;
  }
}
