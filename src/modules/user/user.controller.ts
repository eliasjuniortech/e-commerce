import { Body, Controller, Delete, Get, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import type { User } from "@prisma/client";
import type { Response } from "express";
import "multer";
import { CurrentUser } from "../auth/auth.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResponseUserDto } from "./dto/response-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async registerUser(@Body() body: CreateUserDto, @UploadedFile() file?: Express.Multer.File): Promise<ResponseUserDto> {
    return await this.userService.registerUser(body, file);
  }

  @Get("/me")
  @UseGuards(AuthGuard("access_token"))
  async findOneUser(@CurrentUser() user: User): Promise<ResponseUserDto> {
    return await this.userService.findUserByEmail(user.id);
  }

  @Patch("/me")
  @UseGuards(AuthGuard("access_token"))
  @UseInterceptors(FileInterceptor("file"))
  async updateUser(@CurrentUser() user: User, @Body() body: UpdateUserDto, @UploadedFile() file?: Express.Multer.File): Promise<ResponseUserDto> {
    return await this.userService.updateUser(user.email, body, file);
  }

  @Delete("/me")
  @UseGuards(AuthGuard("access_token"))
  async removeUser(@CurrentUser() user: User): Promise<void> {
    return await this.userService.removeUser(user.id);
  }

  @Patch("/change-password")
  @UseGuards(AuthGuard("access_token"))
  async changePassword(@Res({ passthrough: true }) response: Response, @CurrentUser() user: User, @Body() data: UpdatePasswordDto) {
    await this.userService.changePassword(user.id, data);

    response.clearCookie("access_token");
    response.clearCookie("refresh_token");

    return {
      message: "Senha alterada com sucesso!",
    };
  }
}
