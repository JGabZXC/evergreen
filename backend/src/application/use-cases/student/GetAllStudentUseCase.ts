import { StudentAggregate } from "../../../domain/Student";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import mongoose from "mongoose";

export class GetAllStudentUseCase {
  async execute(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    viewMode: "enrolled" | "all" = "enrolled"
  ): Promise<{
    totalDocs: number;
    totalPages: number;
    students: StudentAggregate[];
  }> {
    const pipeline: any[] = [];

    // 1. Match Filter (Active/Inactive, etc)
    // For 'enrolled' view, we usually only want active students, but let's respect the passed filter
    if (Object.keys(filter).length > 0) {
      // Ensure course is cast to ObjectId for aggregation
      if (filter.course && typeof filter.course === "string") {
        filter.course = new mongoose.Types.ObjectId(filter.course);
      }
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
      totalDocs,
      totalPages,
      students,
    };
  }
}
