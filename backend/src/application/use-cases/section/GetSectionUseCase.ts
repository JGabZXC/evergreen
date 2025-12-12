import { SectionModel } from "../../../infrastructure/database/SectionModel";
import { SectionDTO } from "../../../interfaces/http/types/SectionDTO";

export class GetSectionUseCase {
  async execute(id: string) {
    return await SectionModel.findById(id).lean<SectionDTO>();
  }
}
