import mongoose from "mongoose";
import { CourseModel } from "../../infrastructure/database/CourseModel";
import { SubjectTakenModel } from "../../infrastructure/database/SubjectTakenModel";
import { SubjectModel } from "../../infrastructure/database/SubjectModel";
import {
  NotFoundError,
  BadRequestError,
} from "../../interfaces/http/middleware/HttpErrors";
import { GradeLevel } from "../../domain/Subject";
import { Semester } from "../../domain/types/Semester";
import { SubjectStatus } from "../../domain/SubjectTaken";

export class StudentAdvisingService {
  async validatePromotionEligibility(
    studentId: string,
    courseId: string,
    targetGradeLevel: GradeLevel,
    session?: mongoose.ClientSession
  ): Promise<void> {
    // 1. Skip validation for Freshmen (COL-1 or Grade 11)
    if (this.isFirstYear(targetGradeLevel)) {
      return;
    }

    // 2. Identify Previous Grade Level
    const previousGrade = this.getPreviousGradeLevel(targetGradeLevel);
    if (!previousGrade) return;

    // 3. Fetch Course Curriculum
    const course = await CourseModel.findById(courseId).session(
      session || null
    );
    if (!course) throw new NotFoundError("Course curriculum not found.");

    // 4. Get Required Subject ObjectIds (from Course)
    const requiredPreviousItems = course.subjectToBeTaken.filter(
      (item) => item.gradeLevel === previousGrade
    );
    const requiredObjectIds = requiredPreviousItems.flatMap((c) => c.subject);

    if (requiredObjectIds.length === 0) return;

    // 5. Resolve ObjectIds -> Subject Details
    const requiredSubjects = await SubjectModel.find({
      _id: { $in: requiredObjectIds },
    })
      .select("subjectId name")
      .session(session || null);

    // 6. Fetch Student's Academic History
    const history = await SubjectTakenModel.find({ studentId }).session(
      session || null
    );

    // 7. Check for Clearance
    const passedSubjectStrings = new Set(
      history
        .filter(
          (h) =>
            h.status === SubjectStatus.Passed ||
            h.status === SubjectStatus.Credited // REQ 2: Transferees count as passed
        )
        .map((h) => h.subjectId)
    );

    const missingSubjects = requiredSubjects.filter(
      (req) => !passedSubjectStrings.has(req.subjectId)
    );

    if (missingSubjects.length > 0) {
      const missingNames = missingSubjects.map((s) => s.name).join(", ");
      throw new BadRequestError(
        `Cannot enroll in ${targetGradeLevel}. You have unfinished subjects from ${previousGrade}: [${missingNames}]`
      );
    }
  }

  async determineStudentLoad(
    studentId: string,
    courseId: string,
    gradeLevel: GradeLevel,
    semester: Semester,
    session?: mongoose.ClientSession
  ) {
    const course = await CourseModel.findById(courseId).session(
      session || null
    );
    if (!course)
      throw new NotFoundError("Assigned course curriculum not found.");

    // 1. Get Standard Curriculum ObjectIds for this Sem
    const curriculumSubjects = course.subjectToBeTaken.filter(
      (item) => item.gradeLevel === gradeLevel && item.semester === semester
    );
    const standardObjectIds = curriculumSubjects.flatMap((c) => c.subject);

    // 2. Resolve ObjectIds -> String subjectIds
    // We need the full subject details anyway for the final return
    const potentialNewSubjects = await SubjectModel.find({
      _id: { $in: standardObjectIds },
      active: true,
    }).session(session || null);

    // 3. Fetch History
    const academicHistory = await SubjectTakenModel.find({
      studentId,
    }).session(session || null);

    // 4. Identify Passed/Credited String IDs
    const passedSubjectStrings = new Set(
      academicHistory
        .filter(
          (h) =>
            h.status === SubjectStatus.Passed ||
            h.status === SubjectStatus.Credited
        )
        .map((h) => h.subjectId)
    );

    // 5. Filter: New Subjects to Take
    // Compare string vs string
    const subjectsToEnroll = potentialNewSubjects.filter(
      (sub) => !passedSubjectStrings.has(sub.subjectId)
    );

    // 6. Identify Retakes (Failed/Dropped)
    // These are subjects in history that are NOT passed
    const failedHistory = academicHistory.filter(
      (h) =>
        (h.status === SubjectStatus.Failed ||
          h.status === SubjectStatus.Dropped) &&
        !passedSubjectStrings.has(h.subjectId)
    );

    const retakeSubjectIds = failedHistory.map((h) => h.subjectId);

    // Fetch Retake Details
    const retakeDetails = await SubjectModel.find({
      subjectId: { $in: retakeSubjectIds },
      active: true,
    }).session(session || null);

    // Only include retakes valid for this semester
    const validRetakes = retakeDetails.filter((sub) =>
      sub.semesterAvailable.includes(semester)
    );

    // 7. Final Load Assembly
    const finalLoad: any[] = [];

    subjectsToEnroll.forEach((sub) =>
      finalLoad.push({ ...sub.toObject(), isRetake: false })
    );

    validRetakes.forEach((sub) =>
      finalLoad.push({ ...sub.toObject(), isRetake: true })
    );

    return finalLoad;
  }

  // --- Helpers ---

  private isFirstYear(grade: GradeLevel): boolean {
    return grade === GradeLevel.College1 || grade === GradeLevel.Grade11;
  }

  private getPreviousGradeLevel(current: GradeLevel): GradeLevel | null {
    const map: Partial<Record<GradeLevel, GradeLevel>> = {
      [GradeLevel.Grade12]: GradeLevel.Grade11,
      [GradeLevel.College2]: GradeLevel.College1,
      [GradeLevel.College3]: GradeLevel.College2,
      [GradeLevel.College4]: GradeLevel.College3,
      [GradeLevel.College5]: GradeLevel.College4,
      [GradeLevel.College6]: GradeLevel.College5,
    };
    return map[current] || null;
  }
}
