import type { Request, Response } from "express";
import { GetSunatExportsOverviewUseCase } from "../../../application/sunat/use-cases/get-sunat-exports-overview.use-case.js";

export class SunatExportsController {
  constructor(private readonly getSunatExportsOverviewUseCase: GetSunatExportsOverviewUseCase) {}

  async getOverview(_request: Request, response: Response): Promise<void> {
    const overview = await this.getSunatExportsOverviewUseCase.execute();
    response.json(overview);
  }
}
