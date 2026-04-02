import { describe, it, expect, vi } from 'vitest';
import { UserController } from '../../../src/interfaces/http/controllers/UserController';
import { IUpdateUserPasswordUseCase } from '../../../src/application/use-cases/user/IUpdateUserPasswordUseCase';
import { HttpStatus } from '../../../src/domain/enums/HttpStatus';
import type { AuthenticatedRequest } from '../../../src/interfaces/http/middleware/authGuard';
import type { UpdatePasswordUserRequest } from '../../../src/application/dto/UpdatePasswordRequest';
import type { Response } from 'express';

describe('UserController', () => {
  it('calls use-case and returns user on successful changePassword', async () => {
	  const fakeResult = { id: 'user-1', accountNumber: 1, email: 'a@b.com', role: 'STUDENT' };

	const updateUserPasswordUseCase: IUpdateUserPasswordUseCase = {
	  execute: vi.fn().mockResolvedValue(fakeResult),
	} as unknown as IUpdateUserPasswordUseCase;

	const controller = new UserController(updateUserPasswordUseCase);

	const req = {
	  body: { password: 'newpass123', confirmPassword: 'newpass123', currentPassword: 'oldpass' },
	  user: { id: 'user-1' },
		  } as unknown as AuthenticatedRequest<UpdatePasswordUserRequest>;

	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });
	const res = { status } as unknown as Response;

	await controller.changePassword(req, res);

	const executeMock = updateUserPasswordUseCase.execute as unknown as ReturnType<typeof vi.fn>;
	expect(executeMock).toHaveBeenCalled();
	expect(status).toHaveBeenCalledWith(HttpStatus.OK);
	expect(json).toHaveBeenCalledWith({ user: fakeResult });
  });
});





