import bcrypt from "bcrypt";
import { IPasswordService } from "../../domain/interfaces/IPasswordService";

export class PasswordService implements IPasswordService {
  constructor(private readonly saltRounds = 12) {}

  async hash(password: string): Promise<string> {
	return bcrypt.hash(password, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash);
  }
}


