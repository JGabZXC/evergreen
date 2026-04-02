import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateUserPasswordUseCase } from '../../../src/application/use-cases/user/UpdateUserPasswordUseCase';
import { UpdateUserPasswordUseCaseRequest } from '../../../src/application/use-cases/user/IUpdateUserPasswordUseCase';
import { IUserRepository } from '../../../src/domain/interfaces/IUserRepository';
import { IPasswordService } from '../../../src/domain/interfaces/IPasswordService';
import { User } from '../../../src/domain/entities/User';
import { Role } from '../../../src/generated/prisma/enums';

describe('UpdateUserPasswordUseCase', () => {
  let userRepository: Partial<IUserRepository>;
  let passwordService: Partial<IPasswordService>;
  let useCase: UpdateUserPasswordUseCase;
  let compareMock: ReturnType<typeof vi.fn>;
  let hashMock: ReturnType<typeof vi.fn>;

  const sampleUser = new User('user-1', 1, 'a@b.com', Role.STUDENT, true, new Date(), new Date());

  beforeEach(() => {
    userRepository = {
      findById: vi.fn().mockResolvedValue(sampleUser),
      findCredentialsById: vi.fn().mockResolvedValue({ id: 'user-1', email: 'a@b.com', password: 'oldHash' }),
      updatePassword: vi.fn().mockResolvedValue(true),
    };

    compareMock = vi.fn().mockResolvedValue(true);
    hashMock = vi.fn().mockResolvedValue('newHash');

    passwordService = {
      // vi.fn() returns a MockInstance which is callable but TS may not infer exact function signature
      // cast to the expected function types for IPasswordService
      compare: compareMock as unknown as (plain: string, hash: string) => Promise<boolean>,
      hash: hashMock as unknown as (plain: string) => Promise<string>,
    };

    useCase = new UpdateUserPasswordUseCase(userRepository as IUserRepository, passwordService as IPasswordService);
  });

  it('throws when currentPassword is invalid', async () => {
    compareMock.mockResolvedValueOnce(false);

    await expect(
      useCase.execute({ userId: 'user-1', password: 'newpass123', confirmPassword: 'newpass123', currentPassword: 'wrong' })
    ).rejects.toThrow();
  });

  it('updates password when currentPassword is valid', async () => {
    const result = await useCase.execute({ userId: 'user-1', password: 'newpass123', confirmPassword: 'newpass123', currentPassword: 'oldpass' });

    expect(passwordService!.hash).toHaveBeenCalledWith('newpass123');
    expect(userRepository!.updatePassword).toHaveBeenCalledWith('user-1', 'newHash');
    expect(result).toHaveProperty('id', sampleUser.id);
  });

  it('throws when userId is missing', async () => {
    const req: UpdateUserPasswordUseCaseRequest = { userId: '', password: 'p', confirmPassword: 'p' };
    await expect(useCase.execute(req)).rejects.toThrow('userId is required');
  });

  it('throws when password and confirmPassword do not match', async () => {
    const req: UpdateUserPasswordUseCaseRequest = { userId: 'user-1', password: 'a', confirmPassword: 'b' };
    await expect(useCase.execute(req)).rejects.toThrow('Passwords do not match');
  });
});





