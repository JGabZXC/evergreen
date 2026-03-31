import { describe, expect, it, vi } from "vitest";
import { GetAllUserUseCase } from "./GetAllUserUseCase";
import type { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { User } from "../../../domain/entities/User";
import { Role } from "../../../generated/prisma/enums";

const makeUser = () =>
  new User(
    "user-1",
    1,
    "all@example.com",
    Role.TEACHER,
    true,
    new Date("2026-01-01"),
    new Date("2026-01-01"),
  );

describe("GetAllUserUseCase", () => {
  it("normalizes paging input and delegates to repository", async () => {
    const response = {
      data: [makeUser()],
      meta: {
        totalItems: 1,
        itemCount: 1,
        totalPages: 1,
        currentPage: 1,
      },
    };

    const repo = {
      getAll: vi.fn().mockResolvedValue(response),
    } as unknown as IUserRepository;

    const useCase = new GetAllUserUseCase(repo);
    const result = await useCase.execute({ email: "all" }, 0, 0);

    expect(repo.getAll).toHaveBeenCalledWith({ email: "all" }, 1, 1);
    expect(result).toEqual(response);
  });
});
