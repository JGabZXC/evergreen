import {z} from "zod";
import {Response, Request, NextFunction} from "express";
import {BadRequestError} from "./HttpErrors";

export const validateParams = (schema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction)=> {
        const result = schema.safeParse(req.params);
        if(!result.success) {
           const details = z.treeifyError(result.error);
           throw new BadRequestError("Validation failed", details);
        }

        req.params = result.data as unknown as typeof req.params;
        next();
    }
}