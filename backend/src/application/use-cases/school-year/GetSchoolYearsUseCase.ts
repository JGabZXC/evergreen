import { SchoolYearModel } from "../../../infrastructure/database/SchoolYearModel";

export class GetSchoolYearsUseCase {
  async execute() {
    return await SchoolYearModel.find().sort({ year: -1 });
  }
}
