import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { GetAllStudentUseCase } from "./GetAllStudentUseCase";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";

describe("GetAllStudentUseCase Integration Test", () => {
  let mongoServer: MongoMemoryServer;
  let useCase: GetAllStudentUseCase;

  // 1. Setup: Start In-Memory DB
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    useCase = new GetAllStudentUseCase();
  });

  // 2. Teardown: Stop DB
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // 3. Reset: Clear collections between tests so data doesn't leak
  beforeEach(async () => {
    const collections = mongoose.connection.collections;

    if (collections) {
      for (const collection of Object.values(collections)) {
        await collection.deleteMany({});
      }
    }
  });

  it("should retrieve enrolled students with their LATEST enrollment", async () => {
    // --- ARRANGE ---
    const studentId = "STU-001";
    const userId = new Types.ObjectId();
    const courseId = new Types.ObjectId();

    // Seed Student (Base Model)
    await StudentModel.create({
      studentId: studentId,
      userId: userId,
      course: courseId,
      isActive: true,
    });

    // Seed Student Profile
    await StudentProfileModel.create({
      studentId: studentId,
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("2000-01-01"),
    });

    // Seed Enrollments (Directly into collection if Model not available)
    // Old Record
    await mongoose.connection.collection("enrollmentrecords").insertOne({
      studentId: studentId,
      enrollmentDate: new Date("2023-01-01"),
      status: "inactive",
    });
    // New Record (The one we expect)
    await mongoose.connection.collection("enrollmentrecords").insertOne({
      studentId: studentId,
      enrollmentDate: new Date("2024-01-01"),
      status: "active",
    });

    // --- ACT ---
    const result = await useCase.execute({}, 0, 10, "enrolled");

    // --- ASSERT ---
    expect(result.totalDocs).toBe(1);
    const student: any = result.students[0];

    expect(student.studentId).toBe(studentId);

    // Verify the sort logic in the pipeline picked the 2024 date
    expect(student.latestEnrollment).toBeDefined();
    expect(new Date(student.latestEnrollment.enrollmentDate)).toEqual(
      new Date("2024-01-01")
    );

    // Verify profile join
    expect(student.profile).toBeDefined();
    expect(student.profile.firstName).toBe("John");
  });

  it('should exclude students with NO enrollment when viewMode is "enrolled"', async () => {
    // --- ARRANGE ---
    await StudentModel.create({
      studentId: "GHOST-STU",
      userId: new Types.ObjectId(),
      course: new Types.ObjectId(),
      isActive: true,
    });
    // No enrollment inserted

    // --- ACT ---
    const result = await useCase.execute({}, 0, 10, "enrolled");

    // --- ASSERT ---
    expect(result.totalDocs).toBe(0);
    expect(result.students.length).toBe(0);
  });

  it('should include students with NO enrollment when viewMode is "all"', async () => {
    // --- ARRANGE ---
    await StudentModel.create({
      studentId: "GHOST-STU",
      userId: new Types.ObjectId(),
      course: new Types.ObjectId(),
      isActive: true,
    });

    // --- ACT ---
    const result = await useCase.execute({}, 0, 10, "all");

    // --- ASSERT ---
    expect(result.totalDocs).toBe(1);
    const student: any = result.students[0];
    expect(student.studentId).toBe("GHOST-STU");
    expect(student.latestEnrollment).toBeUndefined(); // Should be missing/null
  });

  it("should correctly join Student Profile data", async () => {
    // --- ARRANGE ---
    const sid = "STU-PROFILE";
    await StudentModel.create({
      studentId: sid,
      userId: new Types.ObjectId(),
      course: new Types.ObjectId(),
      isActive: true,
    });

    // Seed Profile
    await StudentProfileModel.create({
      studentId: sid,
      firstName: "Jane",
      lastName: "Doe",
      dateOfBirth: new Date("2001-01-01"),
      address: {
        street: "123 Main St",
        city: "City",
        state: "State",
        zipCode: 12345,
      },
    });

    // Add enrollment to satisfy 'enrolled' view
    await mongoose.connection.collection("enrollmentrecords").insertOne({
      studentId: sid,
      enrollmentDate: new Date(),
    });

    // --- ACT ---
    const result = await useCase.execute({}, 0, 10, "enrolled");

    // --- ASSERT ---
    const student: any = result.students[0];
    expect(student.profile).toBeDefined();
    expect(student.profile.address.street).toBe("123 Main St");
  });

  it("should handle pagination correctly", async () => {
    // --- ARRANGE ---
    // Create 15 students
    const students = [];
    const enrollments = [];
    const courseId = new Types.ObjectId();

    for (let i = 0; i < 15; i++) {
      const sid = `STU-${i}`;
      students.push({
        studentId: sid,
        userId: new Types.ObjectId(),
        course: courseId,
        isActive: true,
      });
      enrollments.push({ studentId: sid, enrollmentDate: new Date() });
    }
    await StudentModel.insertMany(students);
    await mongoose.connection
      .collection("enrollmentrecords")
      .insertMany(enrollments);

    // --- ACT ---
    // Page 1: Limit 10
    const page1 = await useCase.execute({}, 0, 10, "enrolled");
    // Page 2: Skip 10
    const page2 = await useCase.execute({}, 10, 10, "enrolled");

    // --- ASSERT ---
    expect(page1.totalDocs).toBe(15);
    expect(page1.totalPages).toBe(2);
    expect(page1.students.length).toBe(10);

    expect(page2.students.length).toBe(5);
  });
});
