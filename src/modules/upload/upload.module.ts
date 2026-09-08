import { Module } from "@nestjs/common";
import { SupabaseService } from "./supabase/supabase.service";
import { UploadService } from "./upload.service";

@Module({
  providers: [UploadService, SupabaseService],
  exports: [UploadService],
})
export class UploadModule {}
