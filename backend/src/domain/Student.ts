export interface ParentContact {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Student {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthday: Date;
  gender?: "male" | "female" | "other";
  address?: string;
  gradeLevel?: string;
  section?: string;
  parentContact: ParentContact;
  createdAt?: Date;
  updatedAt?: Date;
}
