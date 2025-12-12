import mongoose from "mongoose";
import dotenv from "dotenv";
import { SubjectModel } from "../SubjectModel";
import { CourseModel } from "../CourseModel";
import { Semester } from "../../../domain/types/Semester";
import { GradeLevel } from "../../../domain/types/GradeLevel";

dotenv.config({ path: "../../.env" }); // Adjust path as needed to find your .env

const subjectsData = [
  // --- GENERAL EDUCATION / COMMON ---
  {
    name: "Mathematics in the Modern World",
    subjectId: "GE-MATH",
    description:
      "Nature of mathematics, appreciation of its practical, intellectual, and aesthetic dimensions.",
    targetGradeLevels: [GradeLevel.College1, GradeLevel.College2],
    semesterAvailable: [Semester.First, Semester.Second],
    createdBy: "SYSTEM",
  },
  {
    name: "Purposive Communication",
    subjectId: "GE-COMM",
    description:
      "Writing, speaking, and presenting to different audiences and for various purposes.",
    targetGradeLevels: [GradeLevel.College1],
    semesterAvailable: [Semester.First],
    createdBy: "SYSTEM",
  },
  {
    name: "Understanding the Self",
    subjectId: "GE-UTS",
    description:
      "Nature of identity, factors and forces that affect the development and maintenance of personal identity.",
    targetGradeLevels: [GradeLevel.College1],
    semesterAvailable: [Semester.First, Semester.Second],
    createdBy: "SYSTEM",
  },

  // --- BSCS MAJORS ---
  {
    name: "Introduction to Computing",
    subjectId: "CC-101",
    description: "Overview of the computing industry and computing profession.",
    targetGradeLevels: [GradeLevel.College1],
    semesterAvailable: [Semester.First],
    createdBy: "SYSTEM",
  },
  {
    name: "Computer Programming 1",
    subjectId: "CC-102",
    description: "Basic programming concepts and logic formulation.",
    targetGradeLevels: [GradeLevel.College1],
    semesterAvailable: [Semester.First],
    createdBy: "SYSTEM",
  },
  {
    name: "Data Structures and Algorithms",
    subjectId: "CC-103",
    description: "Standard data structures and algorithms.",
    targetGradeLevels: [GradeLevel.College1],
    semesterAvailable: [Semester.Second],
    createdBy: "SYSTEM",
  },

  // --- BS NURSING MAJORS ---
  {
    name: "Theoretical Foundations of Nursing",
    subjectId: "NCM-100",
    description: "Introduction to nursing theories and conceptual models.",
    targetGradeLevels: [GradeLevel.College1],
    semesterAvailable: [Semester.First],
    createdBy: "SYSTEM",
  },
  {
    name: "Health Assessment",
    subjectId: "NCM-101",
    description:
      "Concepts, principles, and techniques of history taking and physical examination.",
    targetGradeLevels: [GradeLevel.College1],
    semesterAvailable: [Semester.Second],
    createdBy: "SYSTEM",
  },
  {
    name: "Anatomy and Physiology",
    subjectId: "ANA-PHY",
    description: "Study of the structure and function of the human body.",
    targetGradeLevels: [GradeLevel.College1],
    semesterAvailable: [Semester.First],
    createdBy: "SYSTEM",
  },
];

async function seedCourses() {
  try {
    // 1. Connect to Database
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 2. Clear existing collections
    await CourseModel.deleteMany({});
    await SubjectModel.deleteMany({});
    console.log("Cleared Course and Subject collections.");

    // 3. Seed Subjects
    const createdSubjects = await SubjectModel.insertMany(subjectsData);
    console.log(`Seeded ${createdSubjects.length} subjects.`);

    // Helper to find _id by subjectId
    const getSubId = (code: string) => {
      const sub = createdSubjects.find((s) => s.subjectId === code);
      if (!sub) throw new Error(`Subject ${code} not found in seeded data.`);
      return sub._id;
    };

    // 4. Define Courses with Subject Links
    const coursesData = [
      {
        name: "Bachelor of Science in Computer Science",
        code: "BSCS",
        gradeAvailable: "college",
        subjectToBeTaken: [
          // 1st Year - 1st Semester
          {
            semester: Semester.First,
            gradeLevel: GradeLevel.College1,
            subject: [
              getSubId("GE-MATH"),
              getSubId("GE-COMM"),
              getSubId("GE-UTS"),
              getSubId("CC-101"),
              getSubId("CC-102"),
            ],
          },
          // 1st Year - 2nd Semester
          {
            semester: Semester.Second,
            gradeLevel: GradeLevel.College1,
            subject: [
              getSubId("CC-103"),
              getSubId("GE-MATH"), // Assuming they can take it here if missed, or it's a diff math
            ],
          },
        ],
      },
      {
        name: "Bachelor of Science in Nursing",
        code: "BSN",
        gradeAvailable: "college",
        subjectToBeTaken: [
          // 1st Year - 1st Semester
          {
            semester: Semester.First,
            gradeLevel: GradeLevel.College1,
            subject: [
              getSubId("GE-UTS"),
              getSubId("GE-COMM"),
              getSubId("NCM-100"),
              getSubId("ANA-PHY"),
            ],
          },
          // 1st Year - 2nd Semester
          {
            semester: Semester.Second,
            gradeLevel: GradeLevel.College1,
            subject: [getSubId("GE-MATH"), getSubId("NCM-101")],
          },
        ],
      },
    ];

    // 5. Seed Courses
    const createdCourses = await CourseModel.insertMany(coursesData);
    console.log(`Seeded ${createdCourses.length} courses.`);

    console.log("Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exit(1);
  }
}

seedCourses();
