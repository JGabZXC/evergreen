// Domain contract for refresh tokens

export interface RefreshToken {
  userEmail: string;
  token: string;
  createdAt: Date;
}
