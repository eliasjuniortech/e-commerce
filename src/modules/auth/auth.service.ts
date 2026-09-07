import { HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Roles, User } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";
import { AppException } from "../../shared/exceptions/app.exception";
import { ErrorCode } from "../../shared/exceptions/error-code.enum";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { Payload } from "./types/payload.type";

@Injectable()
export class AuthService {
  private readonly prismaService: PrismaService;
  private readonly jwtService: JwtService;

  constructor(prismaService: PrismaService, jwtService: JwtService) {
    this.prismaService = prismaService;
    this.jwtService = jwtService;
  }

  async login(data: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.validateUser(data.email, data.password);

    const accessToken = await this.createAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.createRefreshToken(user.id, user.email, user.role);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async createAccessToken(id: string, email: string, role: Roles): Promise<string> {
    const payload = { sub: id, email: email, role: role };

    return await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN,
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    });
  }
  async createRefreshToken(id: string, email: string, role: Roles): Promise<string> {
    const payload = { sub: id, email: email, role: role };

    return await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN,
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
    });
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload: Payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN,
      });
      const user = await this.prismaService.user.findFirstOrThrow({ where: { id: payload.sub } });

      const access_token = await this.createAccessToken(user.id, user.email, user.role);
      return access_token;
    } catch {
      throw new AppException(ErrorCode.UNAUTHORIZED, "Refresh Token expirado ou inválido.", HttpStatus.UNAUTHORIZED);
    }
  }

  // Validar se o usuário está cadastrado e se seus dados estão corretos.
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new AppException(ErrorCode.UNAUTHORIZED, "Credênciais inválidas.", HttpStatus.UNAUTHORIZED);
    }

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new AppException(ErrorCode.UNAUTHORIZED, "Credênciais inválidas.", HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
