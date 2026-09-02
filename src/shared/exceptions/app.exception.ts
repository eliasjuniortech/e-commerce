import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode } from "./error-code.enum";

export class AppException extends HttpException {
  constructor(code: ErrorCode, message: string, status: HttpStatus) {
    super({ error: { code: code, message: message } }, status);
  }
}
