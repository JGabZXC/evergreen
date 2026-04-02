import { z } from "zod";
import { Role } from "../../generated/prisma/enums";

const passwordBase = z.string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number");

const passwordMatchSchema = z.object({
  password: passwordBase,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const trimString = z.string().trim();
const requiredString = (name: string) => trimString.min(1, `${name} is required`);

export const loginSchema = z.object({
  identifier: trimString.min(1, "Email or Account Number is required")
      .refine((val) => {
        const isEmail = z.email().safeParse(val).success;
        const isAccountNumber = /^\d+$/.test(val);
        return isEmail || isAccountNumber;
      }, "Please enter a valid email or numeric account number"),
  password: z.string().min(1, "Password is required"),
});

export const userCreateSchema = z.object({
  user: z.object({
    email: z.email("Invalid email address").lowercase(),
    password: passwordBase,
    role: z.enum(Role),
  }),
  userProfile: z.object({
    firstName: requiredString("First name"),
    middleName: trimString.optional(),
    lastName: requiredString("Last name"),
    dateOfBirth: z.coerce
        .date({
          error: "Invalid date of birth format",
          message: "Date of birth is required"
        })
        .refine((d) => d < new Date(), {
          message: "Date of birth cannot be in the future",
          path: ["dateOfBirth"]
        }),
    contactNumber: trimString
        .length(11, "Mobile number must be exactly 11 digits")
        .regex(/^09\d{9}$/, "Must be a valid PH mobile number (e.g., 09123456789)"),
  }),
  userAddress: z.object({
    homeAddress: requiredString("Home address"),
    barangay: requiredString("Barangay"),
    municipality: requiredString("Municipality"),
    province: requiredString("Province"),
    region: requiredString("Region"),
  }),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
}).and(passwordMatchSchema);

export const updatePasswordAdminSchema = z.object({
  userId: z.uuid("Invalid User ID format"),
}).and(passwordMatchSchema);

export type LoginRequest = z.infer<typeof loginSchema>;
export type UserCreateRequest = z.infer<typeof userCreateSchema>;
export type UserRequest = UserCreateRequest["user"];
export type UserProfileRequest = UserCreateRequest["userProfile"];
export type UserAddressRequest = UserCreateRequest["userAddress"];
export type UpdatePasswordRequest = z.infer<typeof updatePasswordSchema>;
export type UpdatePasswordAdminRequest = z.infer<typeof updatePasswordAdminSchema>;
