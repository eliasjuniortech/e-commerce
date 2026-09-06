import { HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import "dotenv/config";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCode } from "../../../shared/exceptions/error-code.enum";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly prismaService: PrismaService;

  constructor(prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.cookies.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
    this.prismaService = prismaService;
  }

  async validate(payload: { sub: string; email: string }): Promise<User> {
    const user = await this.prismaService.user.findFirst({ where: { id: payload.sub } });
    if (!user) {
      throw new AppException(ErrorCode.UNAUTHORIZED, "Usuário não autenticado.", HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
