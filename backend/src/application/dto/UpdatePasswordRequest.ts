export interface UpdatePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface UpdatePasswordUserRequest extends UpdatePasswordRequest {
  currentPassword: string;
}

export interface UpdatePasswordRequestWithUserId extends UpdatePasswordRequest{
  userId: string;
}
