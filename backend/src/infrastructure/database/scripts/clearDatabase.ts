import mongoose from "mongoose";
import { UserModel } from "../UserModel";
import { StaffModel } from "../StaffModel";
import { StudentModel } from "../StudentModel";
import { StaffProfileModel } from "../StaffProfileModel";
import { StudentProfileModel } from "../StudentProfileModel";
import { TeacherDetailsModel } from "../TeacherDetailsModel";
import { RefreshTokenModel } from "../RefreshTokenModel";
import { SubjectModel } from "../SubjectModel";
import { ClassroomModel } from "../SectionModel";
import { CourseModel } from "../CourseModel";
import { EnrollmentRecordModel } from "../EnrollmentRecordModel";

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/school"
  );
  console.log("Connected to MongoDB");

  await Promise.all([
    ClassroomModel.deleteMany({}),
    CourseModel.deleteMany({}),
    EnrollmentRecordModel.deleteMany({}),
    RefreshTokenModel.deleteMany({}),
    StaffProfileModel.deleteMany({}),
    StaffModel.deleteMany({}),
    StudentProfileModel.deleteMany({}),
    StudentModel.deleteMany({}),
    SubjectModel.deleteMany({}),
    TeacherDetailsModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);

  console.log("All collections cleared.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Error clearing database:", err);
  process.exit(1);
});
