import type { HomeShowcaseResponse } from "../../../domain/showcase/entities/showcase.entity.js";
import type { ShowcaseRepository } from "../../../domain/showcase/ports/showcase.repository.js";

export class GetHomeShowcaseUseCase {
  constructor(private readonly showcaseRepository: ShowcaseRepository) {}

  async execute(): Promise<HomeShowcaseResponse> {
    return this.showcaseRepository.getHome();
  }
}
