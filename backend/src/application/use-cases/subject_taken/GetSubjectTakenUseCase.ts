import { FilterQuery } from "mongoose";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { SubjectTakenDTO } from "../../../interfaces/http/types/SubjectTakenDTO";
import { FilterSubjectTaken } from "./GetAllSubjectTakenUseCase";

export class GetSubjectTakenUseCase {
  async execute(filter: FilterQuery<FilterSubjectTaken & { _id: string }>) {
    const subjectTaken =
      await SubjectTakenModel.find(filter).lean<SubjectTakenDTO>();
    return subjectTaken;
  }
}
