import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import "dotenv/config";
import type { Request, Response } from "express";
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
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    const refreshToken = req.cookies.refresh_token;
    const access_token = await this.authService.refreshToken(refreshToken);

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
