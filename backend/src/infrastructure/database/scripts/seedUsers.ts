import mongoose from "mongoose";
import { UserModel } from "../UserModel";
import { Role } from "../../../domain/User";
import { AuthService } from "../../../application/services/authService";

const authService = new AuthService();

const users = [
  {
    email: "admin@school.com",
    password: "adminpass",
    role: Role.Admin,
    active: true,
  },
  {
    email: "registrar@school.com",
    password: "registrarpass",
    role: Role.Registrar,
    active: true,
  },
  {
    email: "teacher@school.com",
    password: "teacherpass",
    role: Role.Teacher,
    active: true,
  },
  {
    email: "student@school.com",
    password: "studentpass",
    role: Role.Student,
    active: true,
  },
];

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/school"
  );
  console.log("Connected to MongoDB");

  for (const user of users) {
    const hashed = await authService.hashPassword(user.password);
    await UserModel.updateOne(
      { email: user.email },
      { $set: { ...user, password: hashed } },
      { upsert: true }
    );
    console.log(`Seeded user: ${user.email}`);
  }

  await mongoose.disconnect();
  console.log("Seeding complete");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
