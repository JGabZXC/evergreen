import { FilterQuery } from "mongoose";
import { StaffRole } from "../../../domain/types/Role";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { UserModel } from "../../../infrastructure/database/UserModel";
import { TeacherDTO } from "../../../interfaces/http/types/StaffDTO";

export class GetAllTeacherUseCase {
  async execute(
    filter: FilterQuery<typeof StaffModel>,
    skip: number,
    limit: number
  ) {
    const teacherUserIds = await UserModel.distinct("_id", {
      role: StaffRole.Teacher,
    });

    const query: FilterQuery<typeof StaffModel> = {
      userId: { $in: teacherUserIds },
    };

    query["userId"] = { $in: teacherUserIds };

    if (filter.isActive) {
      query["isActive"] = filter.isActive;
    }

    const [teachers, totalDocs] = await Promise.all([
      StaffModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("userId")
        .lean<TeacherDTO[]>(),
      StaffModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);
    return { totalDocs, totalPages, teachers };
  }
}
