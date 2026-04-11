import { z } from "zod";
import { SchoolYearStatus } from "../../generated/prisma/enums";

const schoolYearCreateBaseSchema = z.object({
  startDate: z.coerce.date({
    error: "Invalid start date format",
  }),
  endDate: z.coerce.date({
    error: "Invalid end date format",
  }),
  gracePeriod: z.coerce
    .number({
      error: "Invalid grace period",
    })
    .int("Grace period must be an integer")
    .min(0, "Grace period cannot be negative"),
  status: z.enum(SchoolYearStatus),
});

export const schoolYearCreateSchema = schoolYearCreateBaseSchema.refine(
  (data) => data.startDate < data.endDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  },
);

export const schoolYearUpdateSchema = schoolYearCreateBaseSchema
  .partial()
  .extend({
    remarks: z
      .string()
      .trim()
      .max(1000, "Remarks is too long")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
      }

      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export const schoolYearParamsSchema = z.object({
  id: z.uuid("Invalid school year ID"),
});

export type SchoolYearCreateRequest = z.infer<typeof schoolYearCreateSchema>;
export type SchoolYearUpdateRequest = z.infer<typeof schoolYearUpdateSchema>;
