import {z} from "zod";
import {requiredString} from "./commonSchemas";

const checkBoolean = z.preprocess((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
        if (val.toLowerCase() === "true") return true;
        if (val.toLowerCase() === "false") return false;
    }
    return val;
}, z.boolean({ error: "Must be a boolean string" }));

export const sectionCreateSchema = z.object({
    roomId: z.uuid("Invalid room ID"),
    schoolYearId: z.uuid("Invalid school year ID"),
    adviserId: z.uuid("Invalid adviser ID"),
    name: requiredString("Section"),
});

export const sectionUpdateSchema = sectionCreateSchema.partial();

export const sectionParamsSchema = z.object({
    sectionId: z.uuid("Invalid section ID"),
});

export const sectionQuerySchema = z.object({
    roomId: z.uuid().optional(),
    schoolYearId: z.uuid().optional(),
    adviserId: z.uuid().optional(),
    name: z.string().trim().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    nested: checkBoolean.optional(),
});

export type CreateSectionRequest = z.infer<typeof sectionCreateSchema>;
export type UpdateSectionRequest = z.infer<typeof sectionUpdateSchema>;