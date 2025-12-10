import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAllStudentUseCase } from "./GetAllStudentUseCase";
// Adjust the import path below to match your structure
import { StudentModel } from "../../../infrastructure/database/StudentModel";

// 1. Mock the StudentModel to prevent real DB connections
vi.mock("../../../infrastructure/database/StudentModel", () => {
  return {
    StudentModel: {
      aggregate: vi.fn(),
    },
  };
});

describe("GetAllStudentUseCase", () => {
  let useCase: GetAllStudentUseCase;

  beforeEach(() => {
    useCase = new GetAllStudentUseCase();
    vi.clearAllMocks(); // Reset mocks before every test
  });

  it("should return students and pagination data correctly", async () => {
    // Arrange: Mock the DB response structure for $facet
    const mockStudents = [{ studentId: "123" }, { studentId: "456" }];
    const mockTotal = 20;

    // The aggregate with $facet returns an array with one object containing the facet keys
    (StudentModel.aggregate as any).mockResolvedValueOnce([
      {
        metadata: [{ total: mockTotal }],
        data: mockStudents,
      },
    ]);

    // Act
    const result = await useCase.execute({}, 0, 10, "enrolled");

    // Assert: Check returns
    expect(result.totalDocs).toBe(20);
    expect(result.students).toEqual(mockStudents);
    expect(result.totalPages).toBe(2); // 20 docs / 10 limit = 2 pages
  });

  it("should apply the filter if provided", async () => {
    // Arrange
    (StudentModel.aggregate as any).mockResolvedValueOnce([
      { metadata: [], data: [] },
    ]);
    const filter = { status: "active" };

    // Act
    await useCase.execute(filter, 0, 10);

    // Assert: Check pipeline construction
    const pipeline = (StudentModel.aggregate as any).mock.calls[0][0];

    // Expect the first stage to be the $match with our filter
    expect(pipeline[0]).toEqual({ $match: filter });
  });

  it('should set preserveNullAndEmptyArrays to FALSE when viewMode is "enrolled"', async () => {
    // Arrange
    (StudentModel.aggregate as any).mockResolvedValueOnce([
      { metadata: [], data: [] },
    ]);

    // Act
    await useCase.execute({}, 0, 10, "enrolled");

    // Assert
    const pipeline = (StudentModel.aggregate as any).mock.calls[0][0];
    const enrollmentUnwind = pipeline.find(
      (stage: any) =>
        stage.$unwind && stage.$unwind.path === "$latestEnrollment"
    );

    expect(enrollmentUnwind).toBeDefined();
    expect(enrollmentUnwind.$unwind.preserveNullAndEmptyArrays).toBe(false);
  });

  it('should set preserveNullAndEmptyArrays to TRUE when viewMode is "all"', async () => {
    // Arrange
    (StudentModel.aggregate as any).mockResolvedValueOnce([
      { metadata: [], data: [] },
    ]);

    // Act
    await useCase.execute({}, 0, 10, "all");

    // Assert
    const pipeline = (StudentModel.aggregate as any).mock.calls[0][0];
    const enrollmentUnwind = pipeline.find(
      (stage: any) =>
        stage.$unwind && stage.$unwind.path === "$latestEnrollment"
    );

    expect(enrollmentUnwind).toBeDefined();
    expect(enrollmentUnwind.$unwind.preserveNullAndEmptyArrays).toBe(true);
  });

  it("should handle pagination (skip/limit) correctly in $facet", async () => {
    // Arrange
    (StudentModel.aggregate as any).mockResolvedValueOnce([
      { metadata: [], data: [] },
    ]);
    const skip = 5;
    const limit = 5;

    // Act
    await useCase.execute({}, skip, limit);

    // Assert
    const pipeline = (StudentModel.aggregate as any).mock.calls[0][0];
    const facetStage = pipeline.find((stage: any) => stage.$facet);

    expect(facetStage).toBeDefined();
    expect(facetStage.$facet.data).toEqual([
      { $skip: skip },
      { $limit: limit },
    ]);
  });

  it("should handle scenarios with 0 results gracefully", async () => {
    // Arrange: Mock empty metadata (happens when $match filters everything out)
    (StudentModel.aggregate as any).mockResolvedValueOnce([
      {
        metadata: [], // Empty array means no count found
        data: [],
      },
    ]);

    // Act
    const result = await useCase.execute({}, 0, 10);

    // Assert
    expect(result.totalDocs).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.students).toEqual([]);
  });
});
