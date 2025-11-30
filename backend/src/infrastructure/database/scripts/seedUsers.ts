import mongoose from "mongoose";
import { UserModel } from "../UserModel";
import { AuthService } from "../../../application/services/authService";
import { StaffModel } from "../StaffModel";
import { StudentModel } from "../StudentModel";
import { StaffProfileModel } from "../StaffProfileModel";
import { StudentProfileModel } from "../StudentProfileModel";
import { TeacherDetailsModel } from "../TeacherDetailsModel";
import { StaffRole, StudentRole } from "../../../domain/types/Role";

const authService = new AuthService();

const users = [
  {
    email: "admin@school.com",
    password: "adminpass",
    role: StaffRole.Admin,
    active: true,
  },
  {
    email: "registrar@school.com",
    password: "registrarpass",
    role: StaffRole.Registrar,
    active: true,
    employeeId: "EMP-2",
  },
  {
    email: "teacher@school.com",
    password: "teacherpass",
    role: StaffRole.Teacher,
    active: true,
    employeeId: "EMP-3",
  },
  {
    email: "student@school.com",
    password: "studentpass",
    role: StudentRole.Student,
    active: true,
    studentId: "STU-1",
  },
  {
    email: "staff@school.com",
    password: "staffpass",
    role: StaffRole.Staff,
    active: true,
    employeeId: "EMP-1",
  },
];

const staff = [
  { employeeId: "EMP-1", userEmail: "staff@school.com" },
  { employeeId: "EMP-2", userEmail: "registrar@school.com" },
  { employeeId: "EMP-3", userEmail: "teacher@school.com" },
];

const staffProfiles = [
  {
    employeeId: "EMP-1",
    firstName: "Alice",
    lastName: "Smith",
    dateOfBirth: new Date("1980-01-01"),
    phoneNumber: "5551234567",
    address: {
      street: "456 Elm St",
      city: "Metro City",
      state: "State",
      zipCode: 12345,
    },
    position: "Staff",
    department: "Administration",
    hireDate: new Date("2020-01-01"),
  },
  {
    employeeId: "EMP-2",
    firstName: "Regina",
    lastName: "Registrar",
    dateOfBirth: new Date("1985-01-01"),
    phoneNumber: "5559876543",
    address: {
      street: "789 Oak St",
      city: "Metro City",
      state: "State",
      zipCode: 54321,
    },
    position: "Registrar",
    department: "Registrar",
    hireDate: new Date("2015-01-01"),
  },
  {
    employeeId: "EMP-3",
    firstName: "Bob",
    lastName: "Johnson",
    dateOfBirth: new Date("1975-01-01"),
    phoneNumber: "5551112222",
    address: {
      street: "321 Pine St",
      city: "Metro City",
      state: "State",
      zipCode: 67890,
    },
    position: "Teacher",
    department: "Faculty",
    hireDate: new Date("2010-01-01"),
  },
];

const students = [{ studentId: "STU-1", userEmail: "student@school.com" }];

const studentProfiles = [
  {
    studentId: "STU-1",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Date("2005-01-01"),
    phoneNumber: "1234567890",
    address: {
      street: "123 Main St",
      city: "Metro City",
      state: "State",
      zipCode: 11111,
    },
    guardianDetails: {
      name: "Jane Doe",
      contact: "0987654321",
      relation: "Mother",
    },
  },
];

const teacherDetails = [
  {
    employeeId: "EMP-3",
    specializations: ["Math", "Science"],
    masteralDegree: [
      {
        field: "Education",
        institution: "State University",
        yearCompleted: 2015,
      },
    ],
    doctoralDegree: [],
  },
];

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/school"
  );
  console.log("Connected to MongoDB");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Seed users and collect created user docs
    const createdUsers: { [email: string]: any } = {};
    for (const user of users) {
      const hashed = await authService.hashPassword(user.password);
      const createdUser = await UserModel.findOneAndUpdate(
        { email: user.email },
        { $set: { ...user, password: hashed } },
        { upsert: true, new: true, session }
      );
      createdUsers[user.email] = createdUser;
    }
    // Seed staff
    for (const s of staff) {
      const user = createdUsers[s.userEmail];
      if (user) {
        await StaffModel.updateOne(
          { userId: user._id },
          { $set: { userId: user._id, employeeId: s.employeeId } },
          { upsert: true, session }
        );
      }
    }
    // Seed staff profiles
    for (const sp of staffProfiles) {
      await StaffProfileModel.updateOne(
        { employeeId: sp.employeeId },
        { $set: sp },
        { upsert: true, session }
      );
    }
    // Seed students
    for (const s of students) {
      const user = createdUsers[s.userEmail];
      if (user) {
        await StudentModel.updateOne(
          { userId: user._id },
          { $set: { userId: user._id, studentId: s.studentId } },
          { upsert: true, session }
        );
      }
    }
    // Seed student profiles
    for (const sp of studentProfiles) {
      const student = await StudentModel.findOne({
        studentId: sp.studentId,
      }).session(session);
      if (student) {
        await StudentProfileModel.updateOne(
          { studentId: sp.studentId },
          { $set: sp },
          { upsert: true, session }
        );
      }
    }
    // Seed teacher details
    for (const td of teacherDetails) {
      const staff = await StaffModel.findOne({
        employeeId: td.employeeId,
      }).session(session);
      if (staff) {
        await TeacherDetailsModel.updateOne(
          { employeeId: td.employeeId },
          { $set: td },
          { upsert: true, session }
        );
      }
    }
    await session.commitTransaction();
    console.log("Seeding complete");
  } catch (err) {
    await session.abortTransaction();
    console.error("Seeding error, transaction aborted:", err);
    process.exit(1);
  } finally {
    session.endSession();
    await mongoose.disconnect();
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
