import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endpoint') || 'minio',
      port: this.configService.get<number>('minio.port') || 9000,
      useSSL: this.configService.get<boolean>('minio.useSsl') || false,
      accessKey: this.configService.get<string>('minio.accessKey') || 'minio_admin',
      secretKey: this.configService.get<string>('minio.secretKey') || 'minio_secret_key',
    });
    this.defaultBucket = this.configService.get<string>('minio.defaultBucket') || 'media';
  }

  async onModuleInit() {
    this.logger.log('Initializing S3 MinIO storage buckets connections...');
    try {
      const bucketExists = await this.minioClient.bucketExists(this.defaultBucket);
      if (!bucketExists) {
        this.logger.log(`Bucket ${this.defaultBucket} not found. Creating it...`);
        await this.minioClient.makeBucket(this.defaultBucket);
        
        // Expose public read access policy on default media bucket
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.defaultBucket}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.defaultBucket, JSON.stringify(policy));
      }
      this.logger.log('MinIO storage initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize S3 MinIO storage:', error);
    }
  }

  async uploadFile(filename: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    const uniqueName = `${Date.now()}-${filename.replace(/\s+/g, '_')}`;
    
    await this.minioClient.putObject(
      this.defaultBucket,
      uniqueName,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': mimeType },
    );

    // Renders public S3 file pathway URL
    const useSsl = this.configService.get<boolean>('minio.useSsl') || false;
    const protocol = useSsl ? 'https' : 'http';
    const endpoint = this.configService.get<string>('minio.endpoint') || 'localhost';
    const port = this.configService.get<number>('minio.port') || 9000;
    
    // Renders local dev pathway mapping or gateway domain proxy path
    if (endpoint === 'minio') {
      return `http://localhost/minio/${this.defaultBucket}/${uniqueName}`;
    }
    return `${protocol}://${endpoint}:${port}/${this.defaultBucket}/${uniqueName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      
      await this.minioClient.removeObject(this.defaultBucket, filename);
      this.logger.log(`Physical asset ${filename} successfully deleted from MinIO.`);
    } catch (error) {
      this.logger.error(`Failed to delete physical asset from MinIO: ${filePath}`, error);
    }
  }
}
