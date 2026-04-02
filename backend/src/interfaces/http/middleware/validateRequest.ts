import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { BadRequestError } from "./HttpErrors";

export const validateBody = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Use z.treeifyError instead of the deprecated flatten() API
      const details = z.treeifyError(result.error);
      throw new BadRequestError("Validation failed", details);
    }

    // Replace body with parsed/coerced data
    req.body = result.data;
    next();
  };
};





