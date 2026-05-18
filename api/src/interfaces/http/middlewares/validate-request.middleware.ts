import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { HttpError } from './http-error.js';

type RequestSource = 'query' | 'body' | 'params';

export function validateRequest(source: RequestSource, schema: ZodTypeAny): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    const parsed = schema.safeParse(request[source]);

    if (!parsed.success) {
      return next(new HttpError(400, 'Request validation failed', parsed.error.flatten()));
    }

    if (source === 'query') {
      request.validatedQuery = parsed.data;
    }

    if (source === 'body') {
      request.validatedBody = parsed.data;
    }

    if (source === 'params') {
      request.validatedParams = parsed.data;
    }

    return next();
  };
}
