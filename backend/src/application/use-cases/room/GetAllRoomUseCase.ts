import { FilterQuery } from "mongoose";
import { RoomStatus, RoomType } from "../../../domain/Room";
import { RoomModel } from "../../../infrastructure/database/RoomModel";
import { RoomDTO } from "../../../interfaces/http/types/RoomDTO";

export interface FilterRooms {
  name?: string;
  type?: RoomType;
  capacity?: number;
  status?: RoomStatus;
  isActive?: boolean;
}

export class GetAllRoomUseCase {
  async execute(filter: FilterRooms = {}, skip = 0, limit = 10) {
    const query: FilterQuery<FilterRooms> = {};
    if (filter.name) query.name = { $regex: filter.name, $options: "i" };
    if (filter.type) query.type = filter.type;
    if (filter.capacity) query.capacity = filter.capacity;
    if (filter.status) query.status = filter.status;
    if (filter.isActive !== undefined) query.isActive = filter.isActive;

    const [rooms, totalDocs] = await Promise.all([
      RoomModel.find(query).skip(skip).limit(limit).lean<RoomDTO[]>(),
      RoomModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return { totalDocs, totalPages, rooms };
  }
}
