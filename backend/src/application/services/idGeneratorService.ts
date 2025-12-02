import { customAlphabet } from "nanoid";

export class IdGeneratorService {
  private generateNumericId = customAlphabet("0123456789", 10);
  generateStudentId(): string {
    return `STU-${this.generateNumericId()}`;
  }

  generateEmployeeId(): string {
    return `EMP-${this.generateNumericId()}`;
  }

  generateId(prefix: string): string {
    return `${prefix}-${this.generateNumericId()}`;
  }
}
