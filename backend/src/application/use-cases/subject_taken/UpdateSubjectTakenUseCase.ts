import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { SubjectTakenDTO } from "../../../interfaces/http/types/SubjectTakenDTO";

export class UpdateSubjectTakenUseCase {
  async execute(id: string, updateData: Partial<SubjectTakenDTO>) {
    const updatedSubjectTaken = await SubjectTakenModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean<SubjectTakenDTO>();
    return updatedSubjectTaken;
  }
}
