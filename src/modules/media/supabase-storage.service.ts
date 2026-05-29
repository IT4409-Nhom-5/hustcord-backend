import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extname } from 'path';

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
    const supabaseKey = (process.env.SUPABASE_ANON_KEY || '').trim();
    this.bucketName = (process.env.SUPABASE_BUCKET || 'attachments').trim();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Anon Key is missing in environment variables');
    }

    console.log('Supabase Init - URL:', supabaseUrl, 'Bucket:', this.bucketName);
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Diagnostic log to see all available buckets
    this.supabase.storage.listBuckets().then(({ data, error }) => {
      if (error) {
        console.error('Error listing Supabase buckets:', error);
      } else {
        console.log('Available buckets on your Supabase project:', data?.map(b => b.name));
      }
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${uniqueSuffix}${extname(file.originalname)}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Supabase Storage Upload Error details:', error);
      throw new BadRequestException(`Upload to Supabase failed: ${error.message}`);
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  }
}
