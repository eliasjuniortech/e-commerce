export class ResponseUserDto {
  id: string;
  username: string;
  email: string;
  pathImage: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, username: string, email: string, pathImage: string | null, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.pathImage = pathImage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
