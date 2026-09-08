import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { User } from "@prisma/client";
import "dotenv/config";
import type { Response } from "express";
import { CurrentUser } from "./auth.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post("login")
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response): Promise<{ message: string }> {
    const tokens = await this.authService.login(body);

    response.cookie("access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    response.cookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: "Login realizado com sucesso!",
    };
  }

  @Post("refresh_token")
  @UseGuards(AuthGuard("refresh_token"))
  async refreshToken(@CurrentUser() user: User, @Res({ passthrough: true }) response: Response): Promise<void> {
    const access_token = await this.authService.createAccessToken(user.id, user.email, user.role);

    response.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
  }

  @Post("logout")
  @UseGuards(AuthGuard("access_token"))
  async logout(@Res({ passthrough: true }) response: Response): Promise<{ message: string }> {
    response.clearCookie("access_token");
    response.clearCookie("refresh_token");

    return {
      message: "Volte sempre!",
    };
  }
}
