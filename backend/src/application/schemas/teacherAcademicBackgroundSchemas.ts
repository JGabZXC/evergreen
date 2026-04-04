import {z} from "zod";
import {TeacherDetailsType} from "../../generated/prisma/enums";
import { requiredString } from "./commonSchemas";

export const teacherAcademicBackgroundCreateSchema = z.object({
    degree:requiredString("Degree"),
    institution: requiredString("Institution"),
    completedAt: z.coerce
        .date({
        error: "Invalid completed at format"
        })
        .refine((d) => d < new Date(), {
            message: "Completed at cannot be in the future",
            path: ["completedAt"]
        }),
    type: z.enum(TeacherDetailsType)
});

export const teacherAcademicBackgroundParamsSchema = z.object({
    id: z.uuid("Invalid teacher academic background ID"),
});

// Update schema: allow partial updates of any of the create fields
export const teacherAcademicBackgroundUpdateSchema = teacherAcademicBackgroundCreateSchema.partial();

export type TeacherAcademicBackgroundRequest = z.infer<typeof teacherAcademicBackgroundCreateSchema>