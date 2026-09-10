export class ResponseUserDto {
  id: string;
  username: string;
  email: string;
  imagePath: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, username: string, email: string, imagePath: string | null, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.imagePath = imagePath;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
