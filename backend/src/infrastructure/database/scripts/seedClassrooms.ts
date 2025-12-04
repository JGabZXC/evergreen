import mongoose from "mongoose";
import dotenv from "dotenv";
import { ClassroomModel } from "../ClassroomModel";
import { StaffModel } from "../StaffModel";
import { UserModel } from "../UserModel";
import { GradeLevel } from "../../../domain/Subject";
import { StaffRole } from "../../../domain/types/Role";

dotenv.config({ path: "../../.env" });

const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]; // Up to 10 sections

async function seedClassrooms() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Fetch Existing Teachers
    // We need users with role 'teacher'
    const teacherUsers = await UserModel.find({ role: StaffRole.Teacher });
    const teacherUserIds = teacherUsers.map((u) => u._id);

    // Get the Staff records for these users to get the employeeId
    const teachers = await StaffModel.find({ userId: { $in: teacherUserIds } });

    if (teachers.length === 0) {
      console.error(
        "No teachers found! Please run 'npm run seed-users' first to create teachers."
      );
      process.exit(1);
    }

    console.log(`Found ${teachers.length} teachers to assign as advisers.`);

    // 2. Clear existing Classrooms
    await ClassroomModel.deleteMany({});
    console.log("Cleared existing classrooms.");

    const classroomsData: any[] = [];
    let teacherIndex = 0;

    // Helper to get next teacher (Round Robin)
    const getNextAdviser = () => {
      const teacher = teachers[teacherIndex];

      if (!teacher) {
        throw new Error(
          "Unexpected error: Teacher undefined during assignment."
        );
      }

      teacherIndex = (teacherIndex + 1) % teachers.length;
      return teacher.employeeId;
    };

    // Helper to generate classrooms for a specific level
    const generateClassrooms = (
      level: GradeLevel,
      count: number,
      namePrefix: string
    ) => {
      for (let i = 0; i < count; i++) {
        const sectionName = SECTIONS[i];
        classroomsData.push({
          adviserId: getNextAdviser(),
          name: `${namePrefix} - Block ${sectionName}`,
          gradeLevel: level,
          capacity: 40, // Default capacity
          currentCapacity: 0,
        });
      }
    };

    // 3. Generate Data
    // SHS-11 (10 Classrooms)
    generateClassrooms(GradeLevel.Grade11, 10, "Grade 11");

    // SHS-12 (10 Classrooms)
    generateClassrooms(GradeLevel.Grade12, 10, "Grade 12");

    // College 1 (5 Classrooms)
    generateClassrooms(GradeLevel.College1, 5, "1st Year College");

    // College 2 (5 Classrooms)
    generateClassrooms(GradeLevel.College2, 5, "2nd Year College");

    // College 3 (5 Classrooms)
    generateClassrooms(GradeLevel.College3, 5, "3rd Year College");

    // College 4 (5 Classrooms)
    generateClassrooms(GradeLevel.College4, 5, "4th Year College");

    // 4. Insert into Database
    const createdClassrooms = await ClassroomModel.insertMany(classroomsData);
    console.log(`Successfully seeded ${createdClassrooms.length} classrooms.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding classrooms:", error);
    process.exit(1);
  }
}

seedClassrooms();
