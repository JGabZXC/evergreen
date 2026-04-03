import { z } from "zod";

// Shared schema utilities used across application schema files
export const trimString = z.string().trim();
export const requiredString = (name: string) =>
  trimString.min(1, `${name} is required`);
export const optionalString = (name: string)=> requiredString(name).or(z.literal("")).optional();

