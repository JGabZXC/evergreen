import { EnrollmentRecordModel } from "../../../infrastructure/database/EnrollmentRecordModel";
import { PopulatedStudentDTO } from "../../../interfaces/http/types/StudentDTO";
import mongoose, { FilterQuery } from "mongoose";

type PopulatedStudentCourseStringDTO = Omit<PopulatedStudentDTO, "course"> & {
  course: string;
};

export class GetStudentsBySectionUseCase {
  async execute(sectionId: string, semester?: number) {
    const query: FilterQuery<{
      section: mongoose.Types.ObjectId;
      semester?: number;
    }> = {
      section: new mongoose.Types.ObjectId(sectionId),
    };

    if (semester) query.semester = semester;

    console.log(query);

    const students = (await EnrollmentRecordModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "studentId",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "users",
          localField: "student.userId",
          foreignField: "_id",
          as: "student.user",
        },
      },
      { $unwind: "$student.user" },
      {
        $project: {
          _id: "$student._id",
          userId: {
            _id: "$student.user._id",
            email: "$student.user.email",
            role: "$student.user.role",
            active: "$student.user.active",
            createdAt: "$student.user.createdAt",
            updatedAt: "$student.user.updatedAt",
          },
          studentId: "$student.studentId",
          course: "$student.course",
          isActive: "$student.isActive",
          profile: "$student.profile",
          createdAt: "$student.createdAt",
          updatedAt: "$student.updatedAt",
        },
      },
    ])) as PopulatedStudentCourseStringDTO[];

    console.log(students);

    return students;
  }
}
