import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "dotenv/config";

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ROLE_KEY!);
  }

  async getClient(): Promise<SupabaseClient> {
    return this.client;
  }
}
