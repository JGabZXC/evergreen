import { z } from "zod";
import { Role } from "../../auth";

const passwordBase = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

const trimString = z.string().trim();
const requiredString = (name: string) => trimString.min(1, `${name} is required`);

export const userCreateSchema = z.object({
  user: z.object({
    email: z.string().email("Invalid email address").transform((s) => s.toLowerCase()),
    password: passwordBase,
    role: z.enum(Role),
  }),
  userProfile: z.object({
    firstName: requiredString("First name"),
    middleName: trimString.optional(),
    lastName: requiredString("Last name"),
    dateOfBirth: z
      .coerce
      .date({ error: "Invalid date of birth format" })
      .refine((d) => d < new Date(), {
        message: "Date of birth cannot be in the future",
        path: ["dateOfBirth"],
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

export type UserCreate = z.infer<typeof userCreateSchema>;

export type UserCreatePayload = UserCreate;

