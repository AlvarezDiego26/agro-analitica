import type { Request, Response } from "express";
import { GetFarmShowcaseUseCase } from "../../../application/showcase/use-cases/get-farm-showcase.use-case.js";
import { GetHomeShowcaseUseCase } from "../../../application/showcase/use-cases/get-home-showcase.use-case.js";
import { GetMarketBuyersShowcaseUseCase } from "../../../application/showcase/use-cases/get-market-buyers-showcase.use-case.js";

export class ShowcaseController {
  constructor(
    private readonly getHomeShowcaseUseCase: GetHomeShowcaseUseCase,
    private readonly getMarketBuyersShowcaseUseCase: GetMarketBuyersShowcaseUseCase,
    private readonly getFarmShowcaseUseCase: GetFarmShowcaseUseCase
  ) {}

  async getHome(_request: Request, response: Response): Promise<void> {
    response.json(await this.getHomeShowcaseUseCase.execute());
  }

  async getMarketBuyers(_request: Request, response: Response): Promise<void> {
    response.json(await this.getMarketBuyersShowcaseUseCase.execute());
  }

  async getFarm(_request: Request, response: Response): Promise<void> {
    response.json(await this.getFarmShowcaseUseCase.execute());
  }
}
