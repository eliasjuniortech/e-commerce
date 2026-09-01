import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
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

  @Delete(":email")
  async removeUser(@Param("email") email: string): Promise<void> {
    return await this.userService.removeUser(email);
  }
}
