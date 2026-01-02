import { SchoolYearModel } from "../../../infrastructure/database/SchoolYearModel";
import { BaseSchoolYear } from "../../../domain/SchoolYear";
import { ConflictError } from "../../../interfaces/http/middleware/HttpErrors";

export class CreateSchoolYearUseCase {
  async execute(input: BaseSchoolYear) {
    try {
      const schoolYear = new SchoolYearModel(input);
      await schoolYear.save();
      return schoolYear;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictError("School Year already exists");
      }
      throw err;
    }
  }
}
