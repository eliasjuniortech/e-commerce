import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({
    message: "O nome é obrigatório.",
  })
  username: string;

  @IsEmail()
  @IsNotEmpty({
    message: "O e-mail é obrigatório.",
  })
  email: string;

  @IsString()
  @IsNotEmpty({
    message: "A senha é obrigatória.",
  })
  @MinLength(8)
  @MaxLength(22, {
    message: "A senha pode conter no máximo 22 caracteres.",
  })
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @Matches(/^[a-zA-Z0-9!@#?.%]+$/, {
    message: "A senha contém caracteres não permitidos.",
  })
  password: string;
}
