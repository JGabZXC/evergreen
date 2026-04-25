import { describe, expect, it, vi } from "vitest";
import { UpdateRoomUseCase } from "../../../src/application/use-cases/room/UpdateRoomUseCase";
import type { IRoomRepository } from "../../../src/domain/interfaces/IRoomRepository";
import { RoomStatus, RoomType } from "../../../src/generated/prisma/enums";

describe("UpdateRoomUseCase", () => {
  it("forwards status-change metadata needed for room status history", async () => {
    const repository: IRoomRepository = {
      getAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(true),
      createStatusHistory: vi.fn(),
    };

    const useCase = new UpdateRoomUseCase(repository);

    const result = await useCase.execute({
      roomId: "de305d54-75b4-431b-adb2-eb6b9e546014",
      data: {
        name: "Room A",
        type: RoomType.CLASSROOM,
        capacity: 30,
        status: RoomStatus.CLOSED,
        remarks: "Updated during allocation",
        changedById: "de305d54-75b4-431b-adb2-eb6b9e546001",
      },
    });

    expect(result).toBe(true);
    expect(repository.update).toHaveBeenCalledWith(
      {
        name: "Room A",
        type: RoomType.CLASSROOM,
        capacity: 30,
        status: RoomStatus.CLOSED,
        remarks: "Updated during allocation",
        changedById: "de305d54-75b4-431b-adb2-eb6b9e546001",
      },
      "de305d54-75b4-431b-adb2-eb6b9e546014",
    );
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.createStatusHistory).not.toHaveBeenCalled();
  });
});

