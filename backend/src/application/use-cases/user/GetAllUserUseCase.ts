import { FilterQuery } from "mongoose";
import { UserModel } from "../../../infrastructure/database/UserModel";
import {
  UserDTO,
  UserDTOPopulated,
} from "../../../interfaces/http/types/UserDTO";

export interface GetAllUserFilter {
  email?: string;
  role?: string;
  active?: boolean;
  embed?: boolean; // To populate Staff or Student data
}

export default class GetAllUserUseCase {
  async execute(filter: FilterQuery<GetAllUserFilter>, skip = 0, limit = 10) {
    let usersPromise;

    if (filter.embed) {
      usersPromise = UserModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("staff")
        .populate("student")
        .lean<UserDTOPopulated[]>();
    } else {
      usersPromise = UserModel.find(filter)
        .skip(skip)
        .limit(limit)
        .lean<UserDTO[]>();
    }

    const [users, totalDocs] = await Promise.all([
      usersPromise,
      UserModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      totalDocs,
      totalPages,
      users,
    };
  }
}
