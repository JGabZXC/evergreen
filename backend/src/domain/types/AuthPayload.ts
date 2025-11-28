export interface AuthPayload {
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
