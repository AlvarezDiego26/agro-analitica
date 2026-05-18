import type { Request, Response } from "express";

export class HealthController {
  getStatus(_request: Request, response: Response): void {
    response.json({
      ok: true,
      service: "agro-analitica-api",
      date: "2026-05-17"
    });
  }
}
