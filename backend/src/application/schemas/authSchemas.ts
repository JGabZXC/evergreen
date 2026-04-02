import { z } from "zod";
import { Role } from "../../generated/prisma/enums";

export const loginSchema = z
  .object({
    identifier: z.string().trim().nonempty(),
    password: z.string().nonempty(),
  })
  .refine((data: { identifier: string; password: string }) => {
    const id = data.identifier;
    if (id.includes("@")) return z.string().email().safeParse(id).success;
    // account number must be only digits
    return /^\d+$/.test(id);
  }, {
    message: "Identifier must be a valid email or account number",
  });

export const userCreateSchema = z.object({
  user: z.object({
    email: z.string().email(),
    password: z.string().min(10),
    role: z.enum(Role),
  }),
  userProfile: z.object({
    firstName: z.string().min(1),
    middleName: z.string().optional(),
    lastName: z.string().min(1),
    dateOfBirth: z
      .string()
      .refine((s: string) => !isNaN(new Date(s).getTime()), {
        message: "Invalid date of birth format",
      }),
    contactNumber: z.string().length(11),
  }),
  userAddress: z.object({
    homeAddress: z.string().min(1),
    barangay: z.string().min(1),
    municipality: z.string().min(1),
    province: z.string().min(1),
    region: z.string().min(1),
  }),
});

// Export inferred types for use in application code (single source of truth)
export type LoginRequest = z.infer<typeof loginSchema>;
export type UserCreateRequest = z.infer<typeof userCreateSchema>;
export type UserRequest = UserCreateRequest["user"];
export type UserProfileRequest = UserCreateRequest["userProfile"];
export type UserAddressRequest = UserCreateRequest["userAddress"];

