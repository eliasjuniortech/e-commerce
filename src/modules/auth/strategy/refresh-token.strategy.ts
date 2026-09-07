import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "refresh_token") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.cookies.refresh_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN!,
    });
  }

  async validate() {}
}
