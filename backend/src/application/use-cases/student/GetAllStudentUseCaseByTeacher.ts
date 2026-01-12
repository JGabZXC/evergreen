import {FilterQuery, PipelineStage} from "mongoose";
import {SubjectScheduleModel} from "../../../infrastructure/database/SubjectScheduleModel";
import {SectionModel} from "../../../infrastructure/database/SectionModel";
import {EnrollmentRecordModel} from "../../../infrastructure/database/EnrollmentRecordModel";
import {SubjectTakenModel} from "../../../infrastructure/database/SubjectTakenModel";
import {StudentModel} from "../../../infrastructure/database/StudentModel";
import {User} from "../../../domain/User";

interface FilterStudentByTeacher {
    teacherId: string; // Employee ID of the teacher
    schoolYear: string;
}

export class GetAllStudentUseCaseByTeacher {
    async execute(filter: FilterQuery<FilterStudentByTeacher>, skip: number, limit: number) {

        const schedules = await SubjectScheduleModel.find({
            "schedules.teacherId": filter.teacherId,
            schoolYear: filter.schoolYear
        });
        const scheduleIds = schedules.map(schedule => schedule._id);

        const subjectStudentIds = await SubjectTakenModel.distinct("studentId", {
            scheduleId: {$in: scheduleIds},
            schoolYear: filter.schoolYear // Ensure SubjectTaken is also for the same year, usually redundant if schedule is checked but good for safety
        });

        const sections = await SectionModel.find({
            adviserId: filter.teacherId,
            schoolYear: filter.schoolYear
        });
        const sectionIds = sections.map(section => section._id);

        const advisedStudentIds = await EnrollmentRecordModel.distinct("studentId", {section: {$in: sectionIds}});

        const allUniqueStudentIds = Array.from(new Set([...subjectStudentIds, ...advisedStudentIds]));

        const totalDocs = allUniqueStudentIds.length;
        const totalPages = Math.ceil(totalDocs / limit);
        const pipeline: PipelineStage[] = [
            { $match: { studentId: { $in: allUniqueStudentIds } } },
            // Lookup Latest Enrollment for the School Year
            {
                $lookup: {
                    from: "enrollmentrecords",
                    let: { sid: "$studentId" },
                    pipeline: [
                        { $match: {
                                $expr: { $eq: ["$studentId", "$$sid"] },
                                schoolYear: filter.schoolYear
                            } },
                        { $sort: { enrollmentDate: -1 } },
                        { $limit: 1 },
                        {
                            $lookup: {
                                from: "sections",
                                localField: "section",
                                foreignField: "_id",
                                as: "section"
                            }
                        },
                        { $unwind: { path: "$section", preserveNullAndEmptyArrays: true } }
                    ],
                    as: "latestEnrollment"
                }
            },
            { $unwind: { path: "$latestEnrollment", preserveNullAndEmptyArrays: true } },
            // Populate User
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            // Populate Course
            {
                $lookup: {
                    from: "courses",
                    let: { cid: "$course" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$cid"] } } },
                        { $project: { _id: 1, name: 1, code: 1 } }
                    ],
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
            { $skip: skip },
            { $limit: limit }
        ];

        const students = await StudentModel.aggregate<Omit<User, "course"> & {course: {name: string, code: string}}>(pipeline);

        return {
            totalDocs,
            totalPages,
            students,
        };
    }
}