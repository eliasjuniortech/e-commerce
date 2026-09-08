import { HttpStatus, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import "multer";
import { AppException } from "../../shared/exceptions/app.exception";
import { ErrorCode } from "../../shared/exceptions/error-code.enum";
import { PrismaService } from "../prisma/prisma.service";
import { UploadService } from "../upload/upload.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResponseUserDto } from "./dto/response-user.dto";

@Injectable()
export class UserService {
  private readonly prismaService: PrismaService;
  private readonly uploadService: UploadService;

  constructor(prismaService: PrismaService, uploadService: UploadService) {
    this.prismaService = prismaService;
    this.uploadService = uploadService;
  }

  async registerUser(data: CreateUserDto, file?: Express.Multer.File): Promise<ResponseUserDto> {
    const user = await this.prismaService.user.findUnique({ where: { email: data.email } });
    if (user) {
      throw new AppException(ErrorCode.USER_ALREADY_EXISTS, "E-mail já cadastrado.", HttpStatus.CONFLICT);
    }

    const name = data.username.split(" ")[0].toLowerCase();
    const imagePath = file ? await this.uploadService.upload("avatars", data.email, name, file) : null;

    const newUser = await this.prismaService.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: await bcrypt.hash(data.password, await bcrypt.genSalt()),
        imagePath: imagePath,
      },
    });
    return new ResponseUserDto(newUser.id, newUser.username, newUser.email, newUser.imagePath, newUser.createdAt, newUser.updatedAt);
  }

  async findOneUser(email: string): Promise<ResponseUserDto> {
    const user = await this.prismaService.user.findFirst({ where: { email: email } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "Usuário não encontrado.", HttpStatus.NOT_FOUND);
    }
    return new ResponseUserDto(user.id, user.username, user.email, user.imagePath, user.createdAt, user.updatedAt);
  }

  async removeUser(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "Usuário não encontrado.", HttpStatus.NOT_FOUND);
    }

    if (user.imagePath) {
      await this.uploadService.remove(user.imagePath);
    }
    await this.prismaService.user.delete({ where: { id: user.id } });
  }
}
