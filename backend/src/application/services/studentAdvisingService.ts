import mongoose, { ClientSession } from "mongoose";
import { CourseModel } from "../../infrastructure/database/CourseModel";
import { SubjectTakenModel } from "../../infrastructure/database/SubjectTakenModel";
import { SubjectModel } from "../../infrastructure/database/SubjectModel";
import {
  NotFoundError,
  BadRequestError,
} from "../../interfaces/http/middleware/HttpErrors";
import { GradeLevel } from "../../domain/types/GradeLevel";
import { Semester } from "../../domain/types/Semester";
import { SubjectStatus } from "../../domain/SubjectTaken";

export class StudentAdvisingService {
  async validatePromotionEligibility(
    studentId: string,
    courseId: string,
    targetGradeLevel: GradeLevel
  ): Promise<void> {
    // 1. Incoming Freshmen (COL-1)
    if (targetGradeLevel === GradeLevel.College1) {
      await this.validateIncomingCollegeStudent(studentId);
      return;
    }

    // 2. Incoming Grade 11 (New SHS)
    if (targetGradeLevel === GradeLevel.Grade11) {
      return;
    }

    // 3. SHS Promotion (Grade 12)
    if (targetGradeLevel === GradeLevel.Grade12) {
      // Strict: Must have passed Grade 11
      await this.validateStrictCompletion(
        studentId,
        courseId,
        GradeLevel.Grade11
      );
      return;
    }

    // 4. College Promotion (COL-2+)
    // Allow irregulars. Failed subjects will be picked up by determineStudentLoad.
    return;
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
    const curriculumSubjects = course.curriculum.filter(
      (item) => item.gradeLevel === gradeLevel && item.semester === semester
    );
    const standardObjectIds = curriculumSubjects.flatMap((c) => c.subject);

    // 2. Resolve ObjectIds -> String subjectIds
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
        .map((h) => h.subject.toString())
    );

    // 5. Filter: New Subjects to Take
    const subjectsToEnroll = potentialNewSubjects.filter(
      (sub) => !passedSubjectStrings.has(sub._id.toString())
    );

    // 6. Identify Retakes (Failed/Dropped)
    const failedHistory = academicHistory.filter(
      (h) =>
        (h.status === SubjectStatus.Failed ||
          h.status === SubjectStatus.Dropped) &&
        !passedSubjectStrings.has(h.subject.toString())
    );

    const retakeSubjectIds = failedHistory.map((h) => h.subject);

    // Fetch Retake Details
    const retakeDetails = await SubjectModel.find({
      _id: { $in: retakeSubjectIds },
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

  private async validateIncomingCollegeStudent(studentId: string) {
    const history = await SubjectTakenModel.find({ studentId });
    if (history.length === 0) return; // New student

    // Check for unredeemed failures
    const passedSubjects = new Set(
      history
        .filter(
          (h) =>
            h.status === SubjectStatus.Passed ||
            h.status === SubjectStatus.Credited
        )
        .map((h) => h.subject.toString())
    );

    const failedSubjects = history
      .filter(
        (h) =>
          h.status === SubjectStatus.Failed ||
          h.status === SubjectStatus.Dropped
      )
      .map((h) => h.subject.toString());

    for (const failedId of failedSubjects) {
      if (!passedSubjects.has(failedId)) {
        throw new BadRequestError(
          "Cannot enroll in College. You have unfinished subjects from previous levels."
        );
      }
    }
  }

  private async validateStrictCompletion(
    studentId: string,
    courseId: string,
    requiredGradeLevel: GradeLevel
  ) {
    const course = await CourseModel.findById(courseId);
    if (!course) throw new NotFoundError("Course curriculum not found.");

    const requiredItems = course.curriculum.filter(
      (item) => item.gradeLevel === requiredGradeLevel
    );
    const requiredObjectIds = requiredItems.flatMap((c) => c.subject);

    if (requiredObjectIds.length === 0) return;

    const history = await SubjectTakenModel.find({ studentId });

    const passedSubjectStrings = new Set(
      history
        .filter(
          (h) =>
            h.status === SubjectStatus.Passed ||
            h.status === SubjectStatus.Credited
        )
        .map((h) => h.subject.toString())
    );

    const missingIds = requiredObjectIds.filter(
      (id) => !passedSubjectStrings.has(id.toString())
    );

    if (missingIds.length > 0) {
      const missingSubjects = await SubjectModel.find({
        _id: { $in: missingIds },
      });
      const missingNames = missingSubjects.map((s) => s.name).join(", ");
      throw new BadRequestError(
        `Cannot enroll in next level. You have unfinished subjects from ${requiredGradeLevel}: [${missingNames}]`
      );
    }
  }
}
