import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import "dotenv/config";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AccessTokenStrategy } from "./strategy/access-token.strategy";

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN,
      signOptions: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
      },
    }),
  ],
  providers: [AuthService, AccessTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
