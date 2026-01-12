import { StudentAggregate } from "../../../domain/Student";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { SchoolYearModel } from "../../../infrastructure/database/SchoolYearModel";
import { SchoolYearStatus } from "../../../domain/SchoolYear";
import mongoose, {FilterQuery, PipelineStage, Types} from "mongoose";

export interface FilterStudent {
  course?: string | Types.ObjectId;
  isActive?: boolean;
  studentId?: string;
  schoolYear?: string;
  search?: string;
}

export class GetAllStudentUseCase {
  async execute(
    filter: FilterQuery<FilterStudent>,
    skip: number,
    limit: number,
    viewMode: "enrolled" | "all" = "enrolled"
  ): Promise<{
    totalDocs: number;
    totalPages: number;
    students: StudentAggregate[];
  }> {
    const pipeline: PipelineStage[] = [];

    const queryFilter: FilterStudent = { ...filter };
    let targetSchoolYear = queryFilter.schoolYear;

    // Remove schoolYear from student match filter as it belongs to enrollment
    delete queryFilter.schoolYear;

    if (!targetSchoolYear) {
      const activeSy = await SchoolYearModel.findOne({
        status: SchoolYearStatus.Active,
      });
      if (activeSy) targetSchoolYear = activeSy.year;
    }

    if (Object.keys(queryFilter).length > 0) {
      // Ensure course is cast to ObjectId for aggregation
        if (queryFilter.course && typeof queryFilter.course === "string") {
            queryFilter.course = new mongoose.Types.ObjectId(queryFilter.course);
        }
      pipeline.push({ $match: queryFilter });
    }

    const lookupMatch: Record<string, any> = { $expr: { $eq: ["$studentId", "$$sid"] } };

    if (targetSchoolYear) {
      lookupMatch.schoolYear = targetSchoolYear;
    }

    pipeline.push({
      $lookup: {
        from: "enrollmentrecords",
        let: { sid: "$studentId" },
        pipeline: [
          { $match: lookupMatch },
          { $sort: { enrollmentDate: -1 } }, // Get latest
          { $limit: 1 },
        ],
        as: "latestEnrollment",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$latestEnrollment",
        preserveNullAndEmptyArrays: viewMode === "all",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    });

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
      $addFields: {
        course: {
          $cond: {
            if: { $ifNull: ["$course", false] },
            then: { name: "$course.name" },
            else: "$$REMOVE",
          },
        },
      },
    });

    pipeline.push({
      $lookup : {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId"
      }
    });

    pipeline.push({
      $unwind: {
        path: "$userId",
        preserveNullAndEmptyArrays: true,
      }
    })

    pipeline.push({
      $addFields: {
        userId: {
          $cond: {
            if: { $ifNull: ["$userId", false] },
            then: { _id: "$userId._id", email: "$userId.email"},
            else: "$$REMOVE",
          }
        }
      }
    })

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
