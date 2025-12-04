import mongoose from "mongoose";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import { RegisterStaffUseCase } from "../../../application/use-cases/RegisterStaffUseCase";
import { RegisterStudentUseCase } from "../../../application/use-cases/RegisterStudentUseCase";
import { CreateStaffProfileUseCase } from "../../../application/use-cases/user/CreateStaffProfileUseCase";
import { CreateStudentProfileUseCase } from "../../../application/use-cases/user/CreateStudentProfileUseCase";
import { CreateTeacherDetailsUseCase } from "../../../application/use-cases/CreateTeacherDetailsUseCase";
import { User } from "../../../domain/User";
import { CourseModel } from "../CourseModel"; // [NEW] Import CourseModel
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

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
    email: "sarah.science@school.com",
    password: "teacherpass",
    role: StaffRole.Teacher,
    active: true,
    profiles: {
      firstName: "Sarah",
      lastName: "Connor",
      dateOfBirth: "1982-03-15",
      phoneNumber: "5552223333",
      address: {
        street: "101 Biology Ln",
        city: "Science City",
        state: "State",
        zipCode: 13579,
      },
      department: "Faculty",
      hireDate: "2012-08-01",
    },
    details: {
      specializations: ["Biology", "Chemistry", "Anatomy"],
      masteralDegree: [
        {
          field: "Biological Sciences",
          institution: "Nature University",
          yearCompleted: 2010,
        },
      ],
      doctoralDegree: [
        {
          field: "Microbiology",
          institution: "Global Science Institute",
          yearCompleted: 2018,
        },
      ],
    },
  },
  {
    email: "mark.history@school.com",
    password: "teacherpass",
    role: StaffRole.Teacher,
    active: true,
    profiles: {
      firstName: "Mark",
      lastName: "Twain",
      dateOfBirth: "1970-11-30",
      phoneNumber: "5554445555",
      address: {
        street: "55 History Blvd",
        city: "Old Town",
        state: "State",
        zipCode: 97531,
      },
      department: "Faculty",
      hireDate: "2008-06-15",
    },
    details: {
      specializations: ["World History", "Social Studies", "Civics"],
      masteralDegree: [
        {
          field: "History Education",
          institution: "Liberal Arts College",
          yearCompleted: 2005,
        },
      ],
      doctoralDegree: [],
    },
  },
  {
    email: "alan.tech@school.com",
    password: "teacherpass",
    role: StaffRole.Teacher,
    active: true,
    profiles: {
      firstName: "Alan",
      lastName: "Turing",
      dateOfBirth: "1988-06-23",
      phoneNumber: "5556667777",
      address: {
        street: "1024 Binary Rd",
        city: "Silicon Valley",
        state: "State",
        zipCode: 10101,
      },
      department: "Faculty",
      hireDate: "2018-01-10",
    },
    details: {
      specializations: ["Computer Science", "Programming", "Web Development"],
      masteralDegree: [
        {
          field: "Information Technology",
          institution: "Tech Institute",
          yearCompleted: 2016,
        },
      ],
      doctoralDegree: [],
    },
  },
  {
    email: "emily.lit@school.com",
    password: "teacherpass",
    role: StaffRole.Teacher,
    active: true,
    profiles: {
      firstName: "Emily",
      lastName: "Dickinson",
      dateOfBirth: "1985-12-10",
      phoneNumber: "5558889999",
      address: {
        street: "22 Poet Avenue",
        city: "Writers Ville",
        state: "State",
        zipCode: 45678,
      },
      department: "Faculty",
      hireDate: "2014-09-01",
    },
    details: {
      specializations: ["English Literature", "Creative Writing"],
      masteralDegree: [
        {
          field: "English",
          institution: "Arts University",
          yearCompleted: 2012,
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
    courseCode: "BSCS", // [NEW] Specify the target course code here
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
  // Added a Nursing Student for variety
  {
    email: "nursing@school.com",
    password: "studentpass",
    role: StudentRole.Student,
    active: true,
    courseCode: "BSN", // [NEW] Nursing Student
    profiles: {
      firstName: "Florence",
      lastName: "Nightingale",
      dateOfBirth: "2004-05-12",
      phoneNumber: "09998887777",
      address: {
        street: "456 Health Blvd",
        city: "Care City",
        state: "State",
        zipCode: 22222,
      },
      guardianDetails: {
        name: "William Nightingale",
        contact: "0987123456",
        relation: "Father",
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
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in .env");
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const courses = await CourseModel.find({});
  const courseMap = new Map(courses.map((c) => [c.code, c._id.toString()]));

  if (courseMap.size === 0) {
    console.error("No courses found! Please run 'npm run seed-courses' first.");
    process.exit(1);
  }

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
        const targetCourseId = courseMap.get((user as any).courseCode);

        if (!targetCourseId) {
          console.warn(
            `Warning: Course code ${(user as any).courseCode} not found for ${user.email}. Skipping.`
          );
          continue;
        }

        userCreated = await registerStudent.execute(
          {
            ...user,
            course: targetCourseId,
          },
          session
        );
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
      console.log(`Created ${user.role}: ${user.email}`);
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
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
