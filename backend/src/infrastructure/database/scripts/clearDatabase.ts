import mongoose from "mongoose";
import { UserModel } from "../UserModel";
import { StaffModel } from "../StaffModel";
import { StudentModel } from "../StudentModel";
import { StaffProfileModel } from "../StaffProfileModel";
import { StudentProfileModel } from "../StudentProfileModel";
import { TeacherDetailsModel } from "../TeacherDetailsModel";
import { RefreshTokenModel } from "../RefreshTokenModel";
import { SubjectModel } from "../SubjectModel";

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/school"
  );
  console.log("Connected to MongoDB");

  await Promise.all([
    UserModel.deleteMany({}),
    StaffModel.deleteMany({}),
    StudentModel.deleteMany({}),
    StaffProfileModel.deleteMany({}),
    StudentProfileModel.deleteMany({}),
    TeacherDetailsModel.deleteMany({}),
    RefreshTokenModel.deleteMany({}),
    SubjectModel.deleteMany({}),
  ]);

  console.log("All collections cleared.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Error clearing database:", err);
  process.exit(1);
});
