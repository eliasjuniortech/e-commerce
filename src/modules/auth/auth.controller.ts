import { Body, Controller, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post("login")
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    const accessToken = await this.authService.login(body);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    });

    return {
      message: "Login realizado com sucesso!",
    };
  }
}
