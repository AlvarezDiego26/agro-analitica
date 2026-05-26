import type { FarmShowcaseResponse } from "../../../domain/showcase/entities/showcase.entity.js";
import type { ShowcaseRepository } from "../../../domain/showcase/ports/showcase.repository.js";

export class GetFarmShowcaseUseCase {
  constructor(private readonly showcaseRepository: ShowcaseRepository) {}

  async execute(): Promise<FarmShowcaseResponse> {
    return this.showcaseRepository.getFarm();
  }
}
