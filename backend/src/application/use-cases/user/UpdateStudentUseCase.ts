import mongoose from "mongoose";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import {
  PopulatedStudentDTO,
  StudentDTO,
} from "../../../interfaces/http/types/StudentDTO";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import { flattenObject } from "../../../interfaces/http/utils/flattenObject";

export class UpdateStudentUseCase {
  async execute(
    studentId: string,
    data: Partial<StudentDTO>,
    session?: mongoose.ClientSession
  ) {
    const flattenedData = flattenObject(data);

    const updatedStudent = await StudentModel.findOneAndUpdate(
      { studentId },
      { $set: flattenedData },
      { new: true, session: session || null }
    )
      .populate("userId")
      .lean<PopulatedStudentDTO>();

    if (!updatedStudent) {
      throw new NotFoundError("Student not found");
    }

    return updatedStudent;
  }
}
