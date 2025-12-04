import mongoose from "mongoose";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import { RegisterStaffUseCase } from "../../../application/use-cases/RegisterStaffUseCase";
import { RegisterStudentUseCase } from "../../../application/use-cases/RegisterStudentUseCase";
import { CreateStaffProfileUseCase } from "../../../application/use-cases/user/CreateStaffProfileUseCase";
import { CreateStudentProfileUseCase } from "../../../application/use-cases/user/CreateStudentProfileUseCase";
import { CreateTeacherDetailsUseCase } from "../../../application/use-cases/CreateTeacherDetailsUseCase";
import { User } from "../../../domain/User";

const registerStaff = new RegisterStaffUseCase();
const registerStudent = new RegisterStudentUseCase();
const createStaffProfile = new CreateStaffProfileUseCase();
const createStudentProfile = new CreateStudentProfileUseCase();
const createTeacherDetails = new CreateTeacherDetailsUseCase();

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
    profiles: {
      firstName: "Regina",
      lastName: "Registrar",
      dateOfBirth: "1985-01-01",
      phoneNumber: "5559876543",
      address: {
        street: "789 Oak St",
        city: "Metro City",
        state: "State",
        zipCode: 54321,
      },
      department: "Registrar",
      hireDate: "2015-01-01",
    },
  },
  {
    email: "teacher@school.com",
    password: "teacherpass",
    role: StaffRole.Teacher,
    active: true,
    profiles: {
      firstName: "Bob",
      lastName: "Johnson",
      dateOfBirth: "1975-01-01",
      phoneNumber: "5551112222",
      address: {
        street: "321 Pine St",
        city: "Metro City",
        state: "State",
        zipCode: 67890,
      },
      department: "Faculty",
      hireDate: "2010-01-01",
    },
    details: {
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
  },
  {
    email: "student@school.com",
    password: "studentpass",
    role: StudentRole.Student,
    active: true,

    profiles: {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "2005-01-01",
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
  },
  {
    email: "staff@school.com",
    password: "staffpass",
    role: StaffRole.Staff,
    active: true,
    profiles: {
      firstName: "Alice",
      lastName: "Smith",
      dateOfBirth: "1980-01-01",
      phoneNumber: "5551234567",
      address: {
        street: "456 Elm St",
        city: "Metro City",
        state: "State",
        zipCode: 12345,
      },
      department: "Administration",
      hireDate: "2020-01-01",
    },
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
    for (const user of users) {
      let userCreated: {
        createdUser: User;
        studentId?: string;
        employeeId?: string;
      };
      if (user.role === StudentRole.Student) {
        userCreated = await registerStudent.execute(user, session);
      } else {
        userCreated = await registerStaff.execute(user, session);
      }

      if (user.profiles) {
        if (user.role === StudentRole.Student) {
          await createStudentProfile.execute(
            userCreated.studentId!,
            { ...user.profiles, studentId: userCreated.studentId! },
            session
          );
        } else {
          await createStaffProfile.execute(
            userCreated.employeeId!,
            { ...user.profiles, employeeId: userCreated.employeeId! },
            session
          );
        }

        if (user.details && user.role === StaffRole.Teacher) {
          await createTeacherDetails.execute(
            { ...user.details, employeeId: userCreated.employeeId! },
            session
          );
        }
      }
    }

    await session.commitTransaction();
    console.log("Seeding complete");
  } catch (err) {
    await session.abortTransaction();
    console.error("Seeding error, transaction aborted:", err);
    process.exit(1);
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
