export class ResponseUserDto {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, username: string, email: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
