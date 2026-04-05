import { z } from "zod";
import { requiredString } from "./commonSchemas";

export const specializationCreateSchema = z.object({
  name: requiredString("Name"),
  description: z.string().nullable().optional(),
});

export const specializationUpdateSchema = specializationCreateSchema.optional();

export type SpecializationCreateRequest = z.infer<typeof specializationCreateSchema>;

