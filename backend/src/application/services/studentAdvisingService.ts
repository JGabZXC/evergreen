import mongoose from "mongoose";
import { CourseModel } from "../../infrastructure/database/CourseModel";
import { SubjectTakenModel } from "../../infrastructure/database/SubjectTakenModel";
import { SubjectModel } from "../../infrastructure/database/SubjectModel";
import { NotFoundError } from "../../interfaces/http/middleware/HttpErrors";
import { GradeLevel } from "../../domain/Subject";
import { Semester } from "../../domain/types/Semester";
import { SubjectStatus } from "../../domain/SubjectTaken";

export class StudentAdvisingService {
  /**
   * Determines the list of subjects a student should take for a specific semester.
   * Filters out passed subjects and includes valid retakes.
   */
  async determineStudentLoad(
    studentId: string,
    courseId: string,
    gradeLevel: GradeLevel,
    semester: Semester,
    session?: mongoose.ClientSession
  ) {
    // 1. Fetch Course Curriculum
    const course = await CourseModel.findById(courseId).session(
      session || null
    );
    if (!course) {
      throw new NotFoundError("Assigned course curriculum not found.");
    }

    // 2. Get Standard Subjects for this Year & Semester
    const curriculumSubjects = course.subjectToBeTaken.filter(
      (item) => item.gradeLevel === gradeLevel && item.semester === semester
    );

    const standardSubjectIds = curriculumSubjects.flatMap((c) => c.subject);

    // 3. Fetch Student's Academic History
    const academicHistory = await SubjectTakenModel.find({
      studentId: studentId,
    }).session(session || null);

    const passedSubjectIds = new Set(
      academicHistory
        .filter(
          (h) =>
            h.status === SubjectStatus.Passed ||
            h.status === SubjectStatus.Credited
        )
        .map((h) => h.subjectId)
    );

    const failedHistory = academicHistory.filter(
      (h) =>
        (h.status === SubjectStatus.Failed ||
          h.status === SubjectStatus.Dropped) &&
        !passedSubjectIds.has(h.subjectId)
    );

    // 4. Calculate "New" Subjects (Standard - Passed)
    const subjectsToTakeIds = standardSubjectIds.filter(
      (id) => !passedSubjectIds.has(id.toString())
    );

    const newSubjectDetails = await SubjectModel.find({
      _id: { $in: subjectsToTakeIds },
      active: true,
    }).session(session || null);

    // 5. Calculate "Retake" Subjects (Failed/Dropped and valid for this semester)
    const potentialRetakeIds = failedHistory.map((h) => h.subjectId);

    const retakeDetails = await SubjectModel.find({
      subjectId: { $in: potentialRetakeIds },
      active: true,
    }).session(session || null);

    const validRetakes = retakeDetails.filter((sub) =>
      sub.semesterAvailable.includes(semester)
    );

    // 6. Finalize Load List
    const finalLoad: any[] = [];

    newSubjectDetails.forEach((sub) => {
      finalLoad.push({ ...sub.toObject(), isRetake: false });
    });

    validRetakes.forEach((sub) => {
      finalLoad.push({ ...sub.toObject(), isRetake: true });
    });

    return finalLoad;
  }
}
