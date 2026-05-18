import type { Request, Response } from 'express';
import { AnalyzeCampaignUseCase } from '../../../application/planner/use-cases/analyze-campaign.use-case.js';
import type { AnalyzeCampaignQueryDto } from '../dtos/planner/analyze-campaign.query.js';

export class PlannerController {
  constructor(private readonly analyzeCampaignUseCase: AnalyzeCampaignUseCase) {}

  async analyzeCampaign(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as AnalyzeCampaignQueryDto;
    const analysis = await this.analyzeCampaignUseCase.execute(query);
    response.json(analysis);
  }
}
