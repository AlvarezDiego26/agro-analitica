import type { Request, Response } from "express";
import { GetCurrentAuthUserUseCase } from "../../../application/auth/use-cases/get-current-auth-user.use-case.js";
import { LoginAuthUseCase } from "../../../application/auth/use-cases/login-auth.use-case.js";
import { LogoutAuthUseCase } from "../../../application/auth/use-cases/logout-auth.use-case.js";
import { RegisterAuthUseCase } from "../../../application/auth/use-cases/register-auth.use-case.js";

export class AuthController {
  constructor(
    private readonly registerAuthUseCase: RegisterAuthUseCase,
    private readonly loginAuthUseCase: LoginAuthUseCase,
    private readonly getCurrentAuthUserUseCase: GetCurrentAuthUserUseCase,
    private readonly logoutAuthUseCase: LogoutAuthUseCase
  ) {}

  async register(request: Request, response: Response) {
    const result = await this.registerAuthUseCase.execute(request.validatedBody as never);
    return response.status(201).json(result);
  }

  async login(request: Request, response: Response) {
    const result = await this.loginAuthUseCase.execute(request.validatedBody as never);
    return response.status(200).json(result);
  }

  async me(request: Request, response: Response) {
    const result = await this.getCurrentAuthUserUseCase.execute(request.authToken as string);
    return response.status(200).json(result);
  }

  async logout(request: Request, response: Response) {
    const result = await this.logoutAuthUseCase.execute(request.authToken as string);
    return response.status(200).json(result);
  }
}
