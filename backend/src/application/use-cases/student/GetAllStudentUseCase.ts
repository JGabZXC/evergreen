import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";

export class GetAllStudentUseCase {
  async execute(
    filter: Record<string, any>,
    skip: number,
    limit: number
  ): Promise<{
    students: any[];
    totalDocs: number;
    totalPages: number;
  }> {
    // Ensure we only get active students by default, unless specified otherwise
    const queryFilter = { isActive: true, ...filter };

    const [students, totalDocs] = await Promise.all([
      StudentModel.find(queryFilter)
        .skip(skip)
        .limit(limit)
        .populate("course")
        .lean(),
      StudentModel.countDocuments(queryFilter),
    ]);

    // Fetch profiles for the students
    const studentIds = students.map((s) => s.studentId);
    const profiles = await StudentProfileModel.find({
      studentId: { $in: studentIds },
    }).lean();

    // Merge profile data
    const studentsWithProfiles = students.map((student) => {
      const profile = profiles.find((p) => p.studentId === student.studentId);
      return {
        ...student,
        profile,
      };
    });

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      students: studentsWithProfiles,
      totalDocs,
      totalPages,
    };
  }
}
