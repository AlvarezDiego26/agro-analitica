import type { Request, Response } from "express";
import { CreateFarmUseCase } from "../../../application/farms/use-cases/create-farm.use-case.js";
import { GetCurrentUserFarmsUseCase } from "../../../application/farms/use-cases/get-current-user-farms.use-case.js";
import { UpdateFarmUseCase } from "../../../application/farms/use-cases/update-farm.use-case.js";
import { DeleteFarmUseCase } from "../../../application/farms/use-cases/delete-farm.use-case.js";

export class FarmController {
  constructor(
    private readonly getCurrentUserFarmsUseCase: GetCurrentUserFarmsUseCase,
    private readonly createFarmUseCase: CreateFarmUseCase,
    private readonly updateFarmUseCase: UpdateFarmUseCase,
    private readonly deleteFarmUseCase: DeleteFarmUseCase
  ) {}

  async listCurrentUserFarms(request: Request, response: Response) {
    const result = await this.getCurrentUserFarmsUseCase.execute(request.authToken as string);
    return response.status(200).json(result);
  }

  async createFarm(request: Request, response: Response) {
    const result = await this.createFarmUseCase.execute(request.authToken as string, request.validatedBody as never);
    return response.status(201).json(result);
  }

  async updateFarm(request: Request, response: Response) {
    const farmId = String(request.params.id ?? "");
    const result = await this.updateFarmUseCase.execute(request.authToken as string, farmId, request.body);
    return response.status(200).json({ farm: result });
  }

  async deleteFarm(request: Request, response: Response) {
    const farmId = String(request.params.id ?? "");
    await this.deleteFarmUseCase.execute(request.authToken as string, farmId);
    return response.status(204).send();
  }
}
