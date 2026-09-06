import { Body, Controller, Delete, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/auth.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResponseUserDto } from "./dto/response-user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Post()
  async registerUser(@Body() body: CreateUserDto): Promise<ResponseUserDto> {
    return await this.userService.registerUser(body);
  }

  @Get()
  @UseGuards(AuthGuard("jwt"))
  async findOneUser(@CurrentUser() user: User): Promise<User> {
    return await this.userService.findOneUser(user.email);
  }

  @Delete()
  @UseGuards(AuthGuard("jwt"))
  async removeUser(@CurrentUser() user: User): Promise<void> {
    return await this.userService.removeUser(user.email);
  }
}
