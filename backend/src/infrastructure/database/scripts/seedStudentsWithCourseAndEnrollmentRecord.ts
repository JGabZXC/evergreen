import mongoose from "mongoose";
import dotenv from "dotenv";
import { RegisterStudentUseCase } from "../../../application/use-cases/RegisterStudentUseCase";
import { CreateStudentProfileUseCase } from "../../../application/use-cases/user/CreateStudentProfileUseCase";
import { CreateClassroomUseCase } from "../../../application/use-cases/classroom";
import { EnrollStudentUseCase } from "../../../application/use-cases/enrollment/EnrollStudentUseCase"; // [NEW]
import { CourseModel } from "../CourseModel";
import { SubjectTakenModel } from "../SubjectTakenModel";
import { ClassroomModel } from "../ClassroomModel";
import { EnrollmentRecordModel } from "../EnrollmentRecordModel";
import { SubjectStatus } from "../../../domain/SubjectTaken";
import { EnrollmentStatus } from "../../../domain/EnrollmentRecord";
import { GradeLevel } from "../../../domain/Subject";
import { Semester } from "../../../domain/types/Semester";
import { StudentRole } from "../../../domain/types/Role";

// Load Environment Variables
dotenv.config({ path: "../../.env" });

const registerStudent = new RegisterStudentUseCase();
const createStudentProfile = new CreateStudentProfileUseCase();
const createClassroomUseCase = new CreateClassroomUseCase();
const enrollStudent = new EnrollStudentUseCase(); // [NEW]

async function seedHistory() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in .env");
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  try {
    // 1. FETCH PREREQUISITES
    const bscsCourse = await CourseModel.findOne({ code: "BSCS" });
    const bsnCourse = await CourseModel.findOne({ code: "BSN" });

    if (!bscsCourse || !bsnCourse) {
      throw new Error(
        "Courses not found. Please run 'npm run seed-courses' first."
      );
    }

    const allSubjects = await SubjectModel.find({});

    // 2. CREATE DUMMY CLASSROOM (Section for the Past Semester)
    let dummyClassroom: any = await ClassroomModel.findOne({
      name: "HISTORY-SECTION",
    });

    if (!dummyClassroom) {
      try {
        dummyClassroom = await createClassroomUseCase.execute({
          name: "HISTORY-SECTION",
          gradeLevel: GradeLevel.College1,
          capacity: 50,
          currentCapacity: 0, // Reset for clean counting
          adviserId: "SYSTEM",
        });
      } catch (err) {
        throw new Error(
          `Failed to create dummy classroom: ${(err as Error).message}`
        );
      }
    }

    // ==========================================
    // 3. CREATE STUDENT A (BSCS - PASSED ALL)
    // ==========================================
    console.log("Creating Student A (BSCS - Regular)...");

    // A. Register
    const studentA_User = await registerStudent.execute({
      email: "bscs.passed@school.com",
      password: "password123",
      role: StudentRole.Student,
      course: bscsCourse._id.toString(),
    });

    // B. Profile
    await createStudentProfile.execute(studentA_User.studentId!, {
      studentId: studentA_User.studentId!,
      firstName: "Ace",
      lastName: "Ventura",
      dateOfBirth: "2004-01-01",
      phoneNumber: "09123456789",
      address: {
        street: "123 Success St",
        city: "Win City",
        state: "State",
        zipCode: 1000,
      },
      guardianDetails: {
        name: "Dad Ventura",
        contact: "09999999999",
        relation: "Father",
      },
    });

    // C. ENROLL (Using Use Case)
    // This automatically creates EnrollmentRecord and SubjectTaken records based on BSCS curriculum
    console.log(" - Enrolling Student A in Sem 1...");
    const enrollmentA = await enrollStudent.execute({
      studentId: studentA_User.studentId!,
      gradeLevel: GradeLevel.College1,
      schoolYear: "2023-2024",
      semester: Semester.First,
      classroom: dummyClassroom._id, // Force assignment to history section
      enrollmentDate: new Date("2023-08-01"),
      status: EnrollmentStatus.Enrolled,
    });

    // D. GRADE (Simulate Passing)
    // Update the newly created subjects to "Passed"
    await SubjectTakenModel.updateMany(
      { studentId: studentA_User.studentId!, semester: Semester.First },
      {
        $set: {
          status: SubjectStatus.Passed,
          finalGrade: 1.25,
          remarks: "Passed (Seeded History)",
        },
      }
    );

    if (!enrollmentA)
      throw new Error("Enrollment A not found after enrollment.");

    // Update Enrollment Status to Passed (Completed Semester)
    await EnrollmentRecordModel.findByIdAndUpdate(enrollmentA._id, {
      status: EnrollmentStatus.Passed,
    });
    console.log(" - Student A finished Sem 1 (All Passed).");

    // ==========================================
    // 4. CREATE STUDENT B (BSN - FAILED ONE)
    // ==========================================
    console.log("Creating Student B (BSN - Irregular)...");

    // A. Register
    const studentB_User = await registerStudent.execute({
      email: "bsn.failed@school.com",
      password: "password123",
      role: StudentRole.Student,
      course: bsnCourse._id.toString(),
    });

    // B. Profile
    await createStudentProfile.execute(studentB_User.studentId!, {
      studentId: studentB_User.studentId!,
      firstName: "Florence",
      lastName: "Failer",
      dateOfBirth: "2004-02-02",
      phoneNumber: "09876543210",
      address: {
        street: "456 Struggle St",
        city: "Hard City",
        state: "State",
        zipCode: 2000,
      },
      guardianDetails: {
        name: "Mom Failer",
        contact: "09888888888",
        relation: "Mother",
      },
    });

    // C. ENROLL (Using Use Case)
    console.log(" - Enrolling Student B in Sem 1...");
    const enrollmentB = await enrollStudent.execute({
      studentId: studentB_User.studentId!,
      gradeLevel: GradeLevel.College1,
      schoolYear: "2023-2024",
      semester: Semester.First,
      classroom: dummyClassroom._id,
      enrollmentDate: new Date("2023-08-01"),
      status: EnrollmentStatus.Enrolled,
    });

    // D. GRADE (Simulate Failure)
    // 1. Pass Everything First
    await SubjectTakenModel.updateMany(
      { studentId: studentB_User.studentId!, semester: Semester.First },
      {
        $set: {
          status: SubjectStatus.Passed,
          finalGrade: 1.75,
          remarks: "Passed",
        },
      }
    );

    // 2. Fail "Anatomy and Physiology" (ANA-PHY)
    // We need to find the specific record by looking up the Subject ID
    // Since we don't have the subject ID handy, we use a query with populate or just assumption
    // that the Use Case populated it correctly.
    // Use aggregation or findOne to get the subject ID for ANA-PHY
    const anaPhySubject = allSubjects.find((s) => s.subjectId === "ANA-PHY"); // Helper from context

    if (anaPhySubject) {
      await SubjectTakenModel.updateOne(
        {
          studentId: studentB_User.studentId!,
          subjectId: anaPhySubject.subjectId,
        },
        {
          $set: {
            status: SubjectStatus.Failed,
            finalGrade: 5.0,
            remarks: "Failed due to seed scenario",
          },
        }
      );
    }

    if (!enrollmentB)
      throw new Error("Enrollment B not found after enrollment.");

    // Update Enrollment Status to Failed (Semester not fully cleared)
    await EnrollmentRecordModel.findByIdAndUpdate(enrollmentB._id, {
      status: EnrollmentStatus.Failed,
    });
    console.log(" - Student B finished Sem 1 (Failed ANA-PHY).");

    console.log("\n>>> Seeding Complete!");
    console.log(`1. Regular Student (BSCS): ${studentA_User.studentId}`);
    console.log(`2. Irregular Student (BSN): ${studentB_User.studentId}`);
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Helper to get subjects map if needed (re-added from previous context)
import { SubjectModel } from "../SubjectModel";
async function getSubjectMap() {
  const subs = await SubjectModel.find({});
  return subs;
}

seedHistory();
