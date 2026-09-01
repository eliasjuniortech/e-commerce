import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResponseUserDto } from "./dto/response-user.dto";

@Injectable()
export class UserService {
  private readonly prismaService: PrismaService;

  constructor(prismaService: PrismaService) {
    this.prismaService = prismaService;
  }

  async registerUser(data: CreateUserDto): Promise<ResponseUserDto> {
    const user = await this.prismaService.user.findUnique({ where: { email: data.email } });
    if (user) {
      throw new ConflictException();
    }

    const newUser = await this.prismaService.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: await bcrypt.hash(data.password, await bcrypt.genSalt()),
      },
    });
    return new ResponseUserDto(newUser.id, newUser.username, newUser.email, newUser.createdAt, newUser.updatedAt);
  }

  async removeUser(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new NotFoundException();
    }
    await this.prismaService.user.delete({ where: { id: user.id } });
  }
}
