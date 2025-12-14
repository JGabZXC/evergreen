import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import { EnrollStudentUseCase } from "./EnrollStudentUseCase";

// Domain & Error Imports
import {
  BaseEnrollmentRecord,
  EnrollmentStatus,
} from "../../../domain/EnrollmentRecord";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { GradeLevel } from "../../../domain/types/GradeLevel";
import { Semester } from "../../../domain/types/Semester";

// Infrastructure Imports
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { EnrollmentRecordModel } from "../../../infrastructure/database/EnrollmentRecordModel";
import { SubjectTakenModel } from "../../../infrastructure/database/SubjectTakenModel";
import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SectionModel } from "../../../infrastructure/database/SectionModel";

// -------------------------------------------------------------------------
// 1. Define Hoisted Mocks (Must happen before vi.mock)
// -------------------------------------------------------------------------
const { mockAdvisingInstance, mockAllocationInstance } = vi.hoisted(() => {
  return {
    mockAdvisingInstance: {
      validatePromotionEligibility: vi.fn(),
      determineStudentLoad: vi.fn(),
    },
    mockAllocationInstance: {
      validateManualSelection: vi.fn(),
      findBestAvailableSection: vi.fn(),
    },
  };
});

// -------------------------------------------------------------------------
// 2. Mock Internal Services
// -------------------------------------------------------------------------
vi.mock("../../services/studentAdvisingService", () => {
  return {
    // FIX: Use a standard function() so 'new StudentAdvisingService()' works
    StudentAdvisingService: vi.fn().mockImplementation(function () {
      return mockAdvisingInstance;
    }),
  };
});

vi.mock("../../services/classroomAllocationService", () => {
  return {
    // FIX: Use a standard function() so 'new ClassroomAllocationService()' works
    ClassroomAllocationService: vi.fn().mockImplementation(function () {
      return mockAllocationInstance;
    }),
  };
});

// -------------------------------------------------------------------------
// 3. Mock Mongoose & Models
// -------------------------------------------------------------------------
const mockMongooseChain = (resolvedValue: any) => ({
  session: vi.fn().mockResolvedValue(resolvedValue),
});

vi.mock("mongoose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mongoose")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      startSession: vi.fn(),
    },
  };
});

vi.mock("../../../infrastructure/database/StudentModel");
vi.mock("../../../infrastructure/database/EnrollmentRecordModel");
vi.mock("../../../infrastructure/database/SubjectTakenModel");
vi.mock("../../../infrastructure/database/SubjectScheduleModel");
vi.mock("../../../infrastructure/database/SectionModel");

describe("EnrollStudentUseCase", () => {
  let useCase: EnrollStudentUseCase;

  // Use the hoisted instances for assertions
  const mockAdvisingService = mockAdvisingInstance;
  const mockAllocationService = mockAllocationInstance;

  // Mock Session
  const mockSession = {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    abortTransaction: vi.fn(),
    endSession: vi.fn(),
  };

  const bsitCourseId = "693bf9d786386c400d4473c2";
  const mockStudent = {
    studentId: "ST-2023-001",
    course: bsitCourseId,
  };

  const validInput: BaseEnrollmentRecord = {
    studentId: mockStudent.studentId,
    schoolYear: "2023-2024",
    semester: Semester.First,
    gradeLevel: GradeLevel.College1,
    enrollmentDate: new Date("2023-07-01"),
    status: EnrollmentStatus.Enrolled,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (mongoose.startSession as any).mockResolvedValue(mockSession);

    // Instantiate UseCase
    useCase = new EnrollStudentUseCase();
  });

  it("should successfully enroll the BSIT student when all checks pass", async () => {
    // Arrange
    const mockClassroom = { _id: "section-id-123", name: "BSIT-1A" };
    const mockSubjects = [{ _id: "prog-101" }, { _id: "intro-computing" }];
    const mockSchedules = [
      { subject: "prog-101", teacherId: "teacher-A" },
      { subject: "intro-computing", teacherId: "teacher-B" },
    ];

    // 1. Mock Student Fetch
    (StudentModel.findOne as any).mockReturnValue(
      mockMongooseChain(mockStudent)
    );

    // 2. Mock Checks
    mockAdvisingService.validatePromotionEligibility.mockResolvedValue(
      undefined
    );
    (EnrollmentRecordModel.findOne as any).mockReturnValue(
      mockMongooseChain(null)
    );
    mockAllocationService.findBestAvailableSection.mockResolvedValue(
      mockClassroom
    );

    // 3. Mock Load
    mockAdvisingService.determineStudentLoad.mockResolvedValue(mockSubjects);
    (SubjectScheduleModel.find as any).mockResolvedValue(mockSchedules);

    // 4. Mock Persistence
    (EnrollmentRecordModel.create as any).mockResolvedValue([
      { ...validInput, status: EnrollmentStatus.Enrolled },
    ]);
    (SubjectTakenModel.insertMany as any).mockResolvedValue([]);
    (SectionModel.findByIdAndUpdate as any).mockReturnValue({
      session: vi.fn(),
    });

    // Act
    const result = await useCase.execute(validInput);

    if (!result) throw new Error("Result is undefined");

    // Assert
    expect(StudentModel.findOne).toHaveBeenCalledWith({
      studentId: "ST-2023-001",
    });
    expect(result.status).toBe(EnrollmentStatus.Enrolled);
  });

  it("should throw NotFoundError if student does not exist", async () => {
    (StudentModel.findOne as any).mockReturnValue(mockMongooseChain(null));

    await expect(useCase.execute(validInput)).rejects.toThrow(NotFoundError);
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  it("should throw BadRequestError if student has no course assigned", async () => {
    const studentNoCourse = { ...mockStudent, course: null };
    (StudentModel.findOne as any).mockReturnValue(
      mockMongooseChain(studentNoCourse)
    );

    await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestError);
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  it("should throw ConflictError if student is already enrolled", async () => {
    (StudentModel.findOne as any).mockReturnValue(
      mockMongooseChain(mockStudent)
    );
    mockAdvisingService.validatePromotionEligibility.mockResolvedValue(
      undefined
    );
    (EnrollmentRecordModel.findOne as any).mockReturnValue(
      mockMongooseChain({ _id: "existing-enrollment" })
    );

    await expect(useCase.execute(validInput)).rejects.toThrow(ConflictError);
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  it("should throw BadRequestError if no suitable section found", async () => {
    (StudentModel.findOne as any).mockReturnValue(
      mockMongooseChain(mockStudent)
    );
    (EnrollmentRecordModel.findOne as any).mockReturnValue(
      mockMongooseChain(null)
    );
    mockAllocationService.findBestAvailableSection.mockResolvedValue(null);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      "No suitable section found"
    );
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  it("should throw BadRequestError if student has no subjects to enroll (Finished/Credited)", async () => {
    (StudentModel.findOne as any).mockReturnValue(
      mockMongooseChain(mockStudent)
    );
    (EnrollmentRecordModel.findOne as any).mockReturnValue(
      mockMongooseChain(null)
    );
    mockAllocationService.findBestAvailableSection.mockResolvedValue({
      _id: "room",
    });
    mockAdvisingService.determineStudentLoad.mockResolvedValue([]);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      "No subjects left to enroll"
    );
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });
});
