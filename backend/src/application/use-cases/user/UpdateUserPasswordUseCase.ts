import { IUpdateUserPasswordUseCase, UpdateUserPasswordUseCaseRequest } from "./IUpdateUserPasswordUseCase";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import { UserMapper } from "../../../infrastructure/mapper/UserMapper";
import { IPasswordService } from "../../../domain/interfaces/IPasswordService";

export class UpdateUserPasswordUseCase implements IUpdateUserPasswordUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly passwordService: IPasswordService) {}

  async execute(request: UpdateUserPasswordUseCaseRequest) {
    const { password, confirmPassword, userId, currentPassword } = request as UpdateUserPasswordUseCaseRequest;

    if (!userId) throw new BadRequestError("userId is required");

    if (!password || !confirmPassword) throw new BadRequestError("password and confirmPassword are required");
    if (password !== confirmPassword) throw new BadRequestError("Passwords do not match");

    const existing = await this.userRepository.findById(userId);
    if (!existing) throw new NotFoundError("User not found");

    // If currentPassword provided, verify it (user-initiated change)
    if (currentPassword) {
      const credentials = await this.userRepository.findCredentialsById(userId);
      if (!credentials) throw new NotFoundError("User credentials not found");

      const isValid = await this.passwordService.compare(currentPassword, credentials.password);
      if (!isValid) throw new BadRequestError("Invalid credentials");
    }

    const hashed = await this.passwordService.hash(password);

    await this.userRepository.updatePassword(userId, hashed);

    const updated = await this.userRepository.findById(userId);
    if (!updated) throw new NotFoundError("User not found after update");

    return UserMapper.toResponse(updated);
  }
}
