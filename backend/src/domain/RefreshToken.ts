export interface RefreshToken {
  userEmail: string;
  token: string;
  previousToken?: string;
  createdAt: Date;
}
