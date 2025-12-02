import mongoose from "mongoose";
import {
  BaseTeacherDetails,
  TeacherDetails,
} from "../../domain/TeacherDetails";
import { TeacherDetailsModel } from "../../infrastructure/database/TeacherDetailsModel";

export class CreateTeacherDetailsUseCase {
  async execute(
    detailsData: BaseTeacherDetails,
    session?: mongoose.ClientSession
  ): Promise<TeacherDetails> {
    const [teacherDetails] = await TeacherDetailsModel.create(
      [
        {
          ...detailsData,
        },
      ],
      { session }
    );

    if (!teacherDetails) {
      throw new Error("Failed to create teacher details");
    }

    return teacherDetails;
  }
}
