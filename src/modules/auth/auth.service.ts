import { HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { AppException } from "../../shared/exceptions/app.exception";
import { ErrorCode } from "../../shared/exceptions/error-code.enum";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  private readonly prismaService: PrismaService;
  private readonly jwtService: JwtService;

  constructor(prismaService: PrismaService, jwtService: JwtService) {
    this.prismaService = prismaService;
    this.jwtService = jwtService;
  }

  async login(data: LoginDto): Promise<string> {
    const user = await this.validateUser({ email: data.email, password: data.password });
    return await this.jwtService.signAsync({ sub: user.id, email: user.email });
  }

  async validateUser(data: LoginDto): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppException(ErrorCode.UNAUTHORIZED, "Credênciais inválidas.", HttpStatus.UNAUTHORIZED);
    }

    const passwordValidated = await bcrypt.compare(data.password, user.password);
    if (!passwordValidated) {
      throw new AppException(ErrorCode.UNAUTHORIZED, "Credênciais inválidas.", HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
