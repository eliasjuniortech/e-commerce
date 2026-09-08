import { HttpStatus, Injectable } from "@nestjs/common";
import "multer";
import { AppException } from "../../shared/exceptions/app.exception";
import { ErrorCode } from "../../shared/exceptions/error-code.enum";
import { SupabaseService } from "./supabase/supabase.service";

@Injectable()
export class UploadService {
  private readonly supabaseService: SupabaseService;

  constructor(supabaseService: SupabaseService) {
    this.supabaseService = supabaseService;
  }

  async upload(folder: string, id: string, name: string, file: Express.Multer.File): Promise<string> {
    const client = await this.supabaseService.getClient();

    const extension = file.originalname.split(".").pop();
    const path = `${folder}/${id}/${name}.${extension}`;

    const { error } = await client.storage.from("e-commerce").upload(path, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, `${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return path;
  }

  async remove(path: string): Promise<void> {
    const client = await this.supabaseService.getClient();

    const { error } = await client.storage.from("e-commerce").remove([path]);
    if (error) {
      throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, `${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
