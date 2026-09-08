import { Body, Controller, Delete, Get, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { User } from "@prisma/client";
import "multer";
import { CurrentUser } from "../auth/auth.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResponseUserDto } from "./dto/response-user.dto";
import { UserService } from "./user.service";
import { FileInterceptor } from "@nestjs/platform-express";

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

  @Get()
  @UseGuards(AuthGuard("access_token"))
  async findOneUser(@CurrentUser() user: User): Promise<ResponseUserDto> {
    return await this.userService.findOneUser(user.email);
  }

  @Delete()
  @UseGuards(AuthGuard("access_token"))
  async removeUser(@CurrentUser() user: User): Promise<void> {
    return await this.userService.removeUser(user.email);
  }
}
