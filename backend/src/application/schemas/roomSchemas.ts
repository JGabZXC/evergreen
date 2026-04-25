import {z} from 'zod';
import {requiredString} from "./commonSchemas";
import {RoomStatus, RoomType} from "../../generated/prisma/enums";

const checkBoolean = z.preprocess((val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
    }
    return val;
}, z.boolean({ error: "Must be a boolean string" }));

export const roomCreateSchema = z.object({
    name: requiredString("Room name"),
    type: z.enum(RoomType, {error: "Invalid room type"}),
    capacity: z.number({error: "Invalid number"}).positive({error: "Must be a positive number"}),
    status: z.enum(RoomStatus, {error: "Invalid room status"}),
});

export const roomUpdateSchema = roomCreateSchema.partial().extend({
    remarks: z.string().trim().optional(),
});

export const roomUpdateParamsSchema = z.object({
    roomId: z.uuid("Invalid room ID"),
});

export const roomQuerySchema = z.object({
    name: z.string().trim().optional(),
    type: z.enum(RoomType).optional(),
    capacity: z.coerce.number().positive().optional(),
    createdById: z.uuid().optional(),
    status: z.enum(RoomStatus).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    nested: checkBoolean.optional(),
});

export type CreateRoomRequest = z.infer<typeof roomCreateSchema>;
export type UpdateRoomRequest = z.infer<typeof roomUpdateSchema>;
