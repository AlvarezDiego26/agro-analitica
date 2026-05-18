import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from './http-error.js';

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      message: error.message,
      detail: error.detail ?? null
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Request validation failed',
      detail: error.flatten()
    });
    return;
  }

  response.status(502).json({
    message: 'Request failed while processing data source',
    detail: error instanceof Error ? error.message : 'Unknown error'
  });
}
