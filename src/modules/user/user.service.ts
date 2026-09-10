import { HttpStatus, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import "multer";
import { AppException } from "../../shared/exceptions/app.exception";
import { ErrorCode } from "../../shared/exceptions/error-code.enum";
import { PrismaService } from "../prisma/prisma.service";
import { UploadService } from "../upload/upload.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResponseUserDto } from "./dto/response-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";

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

    const imagePath = file ? await this.uploadService.upload("avatars", data.email, "profile", file) : null;

    const createdUser = await this.prismaService.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: await bcrypt.hash(data.password, await bcrypt.genSalt()),
        imagePath: imagePath,
      },
    });
    return new ResponseUserDto(createdUser.id, createdUser.username, createdUser.email, createdUser.imagePath, createdUser.createdAt, createdUser.updatedAt);
  }

  async findUserByEmail(id: string) {
    const user = await this.prismaService.user.findFirst({ where: { id: id } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "Usuário não encontrado.", HttpStatus.NOT_FOUND);
    }
    return new ResponseUserDto(user.id, user.username, user.email, user.imagePath, user.createdAt, user.updatedAt);
  }

  async updateUser(id: string, data: UpdateUserDto, file?: Express.Multer.File): Promise<ResponseUserDto> {
    const user = await this.prismaService.user.findFirst({ where: { id: id } });
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "Usuário não encontrado.", HttpStatus.NOT_FOUND);
    }

    const username = data.username ? data.username : user.username;

    if (file && user.imagePath) {
      await this.uploadService.remove(user.imagePath);
    }
    const imagePath = file ? await this.uploadService.upload("avatars", user.email, "profile", file) : user.imagePath;

    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data: {
        username: username,
        imagePath: imagePath,
      },
    });
    return new ResponseUserDto(updatedUser.id, updatedUser.username, updatedUser.email, updatedUser.imagePath, updatedUser.createdAt, updatedUser.updatedAt);
  }

  async removeUser(id: string): Promise<void> {
    await this.prismaService.user.delete({ where: { id: id } });
  }

  async changePassword(id: string, data: UpdatePasswordDto): Promise<void> {
    const user = await this.prismaService.user.findFirst({ where: { id: id } });

    const isCurrentPasswordSame = await bcrypt.compare(data.currentPassword, user!.password);
    if (!isCurrentPasswordSame) {
      throw new AppException(ErrorCode.UNAUTHORIZED, "A senha está incorreta.", HttpStatus.UNAUTHORIZED);
    }
    const isNewPasswordSame = await bcrypt.compare(data.newPassword, user!.password);
    if (isNewPasswordSame) {
      throw new AppException(ErrorCode.CONFLICT, "A senha atual, não pode ser igual à senha antiga.", HttpStatus.CONFLICT);
    }

    const hash = await bcrypt.hash(data.newPassword, await bcrypt.genSalt());
    await this.prismaService.user.update({
      where: { id: id },
      data: {
        password: hash,
      },
    });
  }
}
