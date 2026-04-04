import { describe, it, expect, vi } from 'vitest';
import { validateParams } from '../../../src/interfaces/http/middleware/validateParams';
import { teacherAcademicBackgroundParamsSchema } from '../../../src/application/schemas/teacherAcademicBackgroundSchemas';
import { BadRequestError } from '../../../src/interfaces/http/middleware/HttpErrors';
import type { Request, Response, NextFunction } from 'express';

describe('validateParams middleware', () => {
  it('throws BadRequestError for invalid uuid id', () => {
    const middleware = validateParams(teacherAcademicBackgroundParamsSchema);

    const req = { params: { id: 'not-a-uuid' } } as Request<{ id: string }>;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    expect(() => middleware(req, res, next)).toThrow(BadRequestError);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next for valid uuid id and assigns parsed params', () => {
    const middleware = validateParams(teacherAcademicBackgroundParamsSchema);

    // use a canonical v4 example UUID that zod accepts
    const validId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const req = { params: { id: validId } } as Request<{ id: string }>;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.params.id).toBe(validId);
  });
});



