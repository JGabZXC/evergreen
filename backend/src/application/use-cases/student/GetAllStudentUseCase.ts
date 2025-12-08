import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";

export class GetAllStudentUseCase {
  async execute(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    viewMode: "enrolled" | "all" = "enrolled"
  ): Promise<{
    students: any[];
    totalDocs: number;
    totalPages: number;
  }> {
    const pipeline: any[] = [];

    // 1. Match Filter (Active/Inactive, etc)
    // For 'enrolled' view, we usually only want active students, but let's respect the passed filter
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // 2. Lookup Latest Enrollment
    pipeline.push({
      $lookup: {
        from: "enrollmentrecords",
        let: { sid: "$studentId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$studentId", "$$sid"] } } },
          { $sort: { enrollmentDate: -1 } }, // Get latest
          { $limit: 1 },
        ],
        as: "latestEnrollment",
      },
    });

    // 3. Unwind Enrollment
    // If viewMode is 'enrolled', we strictly require an enrollment record (preserve=false)
    // If viewMode is 'all', we keep students even without enrollment (preserve=true)
    pipeline.push({
      $unwind: {
        path: "$latestEnrollment",
        preserveNullAndEmptyArrays: viewMode === "all",
      },
    });

    // 4. Lookup Profile
    pipeline.push({
      $lookup: {
        from: "studentprofiles",
        localField: "studentId",
        foreignField: "studentId",
        as: "profile",
      },
    });
    pipeline.push({
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    });

    // 5. Lookup Course
    pipeline.push({
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
      },
    });
    pipeline.push({
      $unwind: {
        path: "$course",
        preserveNullAndEmptyArrays: true,
      },
    });

    // 6. Pagination Facet
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const [result] = await StudentModel.aggregate(pipeline);

    const totalDocs = result.metadata[0]?.total || 0;
    const students = result.data;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      students,
      totalDocs,
      totalPages,
    };
  }
}
