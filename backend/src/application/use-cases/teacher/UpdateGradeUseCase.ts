// backend/src/application/use-cases/teacher/UpdateGradeUseCase.ts
import mongoose from "mongoose";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { SubjectStatus, SubjectTaken } from "../../../domain/SubjectTaken";
import { SubjectScheduleDTO } from "../../../interfaces/http/types/SubjectScheduleDTO";
import { SchoolYearModel } from "../../../infrastructure/database/SchoolYearModel";
import { SchoolYearStatus } from "../../../domain/SchoolYear";
import { Semester } from "../../../domain/types/Semester";
import { EnrollmentRecordModel } from "../../../infrastructure/database/EnrollmentRecordModel";
import {
  getDepartment,
  Department,
} from "../../../domain/utils/DepartmentUtils";

interface GradeInput {
  subjectTakenId: string; // The ID of the specific row in the grade sheet
  term: "prelim" | "midterm" | "final";
  grade: number;
  remarks?: string;
}

type SubjectTakenPopulatedSchdulesAndTeacherDTO = Omit<
  SubjectTaken,
  "scheduleId"
> & {
  scheduleId: SubjectScheduleDTO;
};

export class UpdateGradeUseCase {
  async execute(
    teacherId: string,
    input: GradeInput,
    session: mongoose.ClientSession
  ) {
    if (input.grade < 0 || input.grade > 100) {
      throw new BadRequestError("Grade must be between 0 and 100.");
    }

    // 1. Find the record and ensure this teacher owns it (Security)
    const record = await SubjectTakenModel.findById(
      input.subjectTakenId
    ).populate("scheduleId");

    if (!record) {
      throw new NotFoundError(
        "Grade record not found or you are not the assigned teacher."
      );
    }

    const isAssigned = (
      record as unknown as SubjectTakenPopulatedSchdulesAndTeacherDTO
    ).scheduleId.schedules.some((s) => s.teacherId === teacherId);

    if (!isAssigned) {
      throw new NotFoundError(
        "Grade record not found or you are not the assigned teacher."
      );
    }

    // 1.5 Validate School Year and Term Deadlines
    const schoolYearRecord = await SchoolYearModel.findOne({
      year: record.schoolYear,
    }).session(session);

    if (!schoolYearRecord) {
      throw new NotFoundError(`School Year ${record.schoolYear} not found.`);
    }

    // Check if School Year is Closed
    if (schoolYearRecord.status === SchoolYearStatus.Closed) {
      throw new BadRequestError(
        "The school year has ended. You cannot edit grades anymore. Please request a grade change from the registrar."
      );
    }

    // Check Term Deadline (Grace period: 1 week after next term starts)
    // Fetch Enrollment to determine Department (College vs K12)
    const enrollment = await EnrollmentRecordModel.findOne({
      studentId: record.studentId,
      schoolYear: record.schoolYear,
      semester: record.semester,
    }).session(session);

    if (!enrollment) {
      // Fallback or Error? If no enrollment, maybe just assume College or throw?
      // For safety, let's assume College if not found, or throw.
      // But SubjectTaken should imply enrollment.
      throw new NotFoundError("Student enrollment record not found.");
    }

    const department = getDepartment(enrollment.gradeLevel);
    const termsList =
      department === Department.College
        ? schoolYearRecord.terms.college
        : schoolYearRecord.terms.k12;

    const currentSemester = record.semester;
    // Sort terms by semester to ensure order (First, Second, Third)
    const terms = termsList.sort((a, b) => a.semester - b.semester);
    const currentTermIndex = terms.findIndex(
      (t) => t.semester === currentSemester
    );

    if (currentTermIndex !== -1) {
      const nextTerm = terms[currentTermIndex + 1];
      // If there is a next term, check if we are past the grace period
      if (nextTerm) {
        const oneWeekAfterNextTermStart = new Date(nextTerm.startDate);
        oneWeekAfterNextTermStart.setDate(
          oneWeekAfterNextTermStart.getDate() + 7
        );

        const now = new Date();
        if (now > oneWeekAfterNextTermStart) {
          throw new BadRequestError(
            `Cannot edit grades for ${Semester[currentSemester]} Semester because the grace period (1 week after next semester start) has passed.`
          );
        }
      }
    }

    // 2. Update the specific term grade
    if (input.term === "prelim") record.prelim = input.grade;
    if (input.term === "midterm") record.midterm = input.grade;
    if (input.term === "final") record.final = input.grade;

    // 3. Auto-Calculate Final Grade (Business Logic)
    // Only calculate if all 3 grades exist
    if (record.prelim && record.midterm && record.final) {
      // Example Formula: Average
      const average = (record.prelim + record.midterm + record.final) / 3;
      record.finalGrade = parseFloat(average.toFixed(2));

      // Determine Status
      record.remarks =
        input.remarks || (record.finalGrade >= 75 ? "Passed" : "Failed");
      record.status =
        record.finalGrade >= 75 ? SubjectStatus.Passed : SubjectStatus.Failed; // Enum update
    }

    (await record.save()).$session(session);
    return record;
  }
}
