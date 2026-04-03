import { z } from "zod";
import { requiredString } from "./commonSchemas";

export const specializationCreateSchema = z.object({
  name: requiredString("Name"),
  description: z.string().optional(),
});

export const specializationUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
});

export type SpecializationCreateRequest = z.infer<typeof specializationCreateSchema>;
export type SpecializationUpdateRequest = z.infer<typeof specializationUpdateSchema>;

