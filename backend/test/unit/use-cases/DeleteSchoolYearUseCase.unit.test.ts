import { describe, it, expect, vi } from "vitest";
import { DeleteSchoolYearUseCase } from "../../../src/application/use-cases/school_year/DeleteSchoolYearUseCase";
import type { ISchoolYearRepository } from "../../../src/domain/interfaces/ISchoolYearRepository";

describe("DeleteSchoolYearUseCase", () => {
  it("hard deletes school year by id", async () => {
    const repository: ISchoolYearRepository = {
      getAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(true),
      createStatusHistory: vi.fn(),
    };

    const useCase = new DeleteSchoolYearUseCase(repository);

    const result = await useCase.execute({
      id: "de305d54-75b4-431b-adb2-eb6b9e546014",
    });

    expect(result).toBe(true);
    expect(repository.delete).toHaveBeenCalledWith(
      "de305d54-75b4-431b-adb2-eb6b9e546014",
    );
  });
});
