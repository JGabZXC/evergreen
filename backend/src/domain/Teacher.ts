export interface Teacher {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthday: Date;
  gender?: "male" | "female" | "other";
  address?: string;
  subjectSpecialization?: string[];
  contactNumber?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
