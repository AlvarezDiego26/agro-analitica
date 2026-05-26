import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./http-error.js";

export function requireAuthToken(request: Request, _response: Response, next: NextFunction): void {
  const authorization = request.headers.authorization;
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : null;
  const sessionToken = bearerToken || request.headers["x-session-token"];

  if (!sessionToken || typeof sessionToken !== "string") {
    next(new HttpError(401, "Missing session token"));
    return;
  }

  request.authToken = sessionToken;
  next();
}
