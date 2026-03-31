import { describe, expect, it, vi } from "vitest";
import { GetUserUseCase } from "./GetUserUseCase";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import { User } from "../../../domain/entities/User";
import { Role } from "../../../generated/prisma/enums";
import type { IUserRepository } from "../../../domain/interfaces/IUserRepository";

const makeUser = () =>
  new User(
    "user-1",
    1,
    "test@example.com",
    Role.STUDENT,
    true,
    new Date("2026-01-01"),
    new Date("2026-01-01"),
  );

describe("GetUserUseCase", () => {
  it("returns user when found", async () => {
    const user = makeUser();
    const repo = {
      findById: vi.fn().mockResolvedValue(user),
    } as unknown as IUserRepository;

    const useCase = new GetUserUseCase(repo);
    const result = await useCase.execute("user-1");

    expect(repo.findById).toHaveBeenCalledWith("user-1");
    expect(result).toBe(user);
  });

  it("throws NotFoundError when user does not exist", async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(null),
    } as unknown as IUserRepository;

    const useCase = new GetUserUseCase(repo);

    await expect(useCase.execute("missing")).rejects.toThrow(NotFoundError);
  });
});
