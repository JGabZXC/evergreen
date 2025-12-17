import { UserModel } from "../../../infrastructure/database/UserModel";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import {
  UserDTO,
  UserDTOPopulated,
} from "../../../interfaces/http/types/UserDTO";

export class GetUserUseCase {
  async execute(userId: string) {
    const user = UserModel.findById(userId)
      .populate("staff")
      .populate("student")
      .lean<UserDTOPopulated>();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
