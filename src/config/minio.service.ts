import { Injectable, Logger, Optional } from '@nestjs/common';
import * as Minio from 'minio';
import { MinioConfig } from './minio-config.interface';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient?: Minio.Client;
  private readonly bucketName: string;
  private readonly isEnabled: boolean;

  constructor(@Optional() private readonly config?: MinioConfig) {
    this.isEnabled = !!(config?.endPoint && config?.accessKey && config?.secretKey);

    if (this.isEnabled) {
      this.minioClient = new Minio.Client({
        endPoint: config!.endPoint,
        port: config!.port,
        useSSL: config!.useSSL,
        accessKey: config!.accessKey,
        secretKey: config!.secretKey,
      });
      this.bucketName = config!.bucketName || 'melio-files';
    } else {
      this.bucketName = 'melio-files';
      this.logger.warn('Minio is disabled - no configuration provided');
    }
    this.initializeBucket();
  }

  private async initializeBucket() {
    if (!this.isEnabled || !this.minioClient) {
      this.logger.log('Minio is disabled - skipping bucket initialization');
      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'eu-west-1');
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
      } else {
        this.logger.log(`Bucket ${this.bucketName} already exists`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize bucket:', error);
    }
  }

  async uploadFile(
    objectName: string,
    filePath: string,
    metaData?: Minio.ItemBucketMetadata,
  ): Promise<string> {
    if (!this.isEnabled || !this.minioClient) {
      this.logger.warn('Minio is disabled - file upload skipped');
      return `minio-disabled://${objectName}`;
    }

    try {
      await this.minioClient.fPutObject(this.bucketName, objectName, filePath, metaData);
      const url = await this.getFileUrl(objectName);
      this.logger.log(`File uploaded successfully: ${objectName}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file ${objectName}:`, error);
      throw error;
    }
  }

  async uploadBuffer(
    objectName: string,
    buffer: Buffer,
    metaData?: Minio.ItemBucketMetadata,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        buffer,
        buffer.length,
        metaData,
      );
      const url = await this.getFileUrl(objectName);
      this.logger.log(`Buffer uploaded successfully: ${objectName}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload buffer ${objectName}:`, error);
      throw error;
    }
  }

  async getFileUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, objectName, expiry);
    } catch (error) {
      this.logger.error(`Failed to get file URL ${objectName}:`, error);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File deleted successfully: ${objectName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${objectName}:`, error);
      throw error;
    }
  }

  async listFiles(prefix?: string): Promise<Minio.BucketItem[]> {
    try {
      const objects: Minio.BucketItem[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj: any) => objects.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(objects));
      });
    } catch (error) {
      this.logger.error('Failed to list files:', error);
      throw error;
    }
  }

  async getFile(objectName: string): Promise<Buffer> {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, objectName);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to get file ${objectName}:`, error);
      throw error;
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, objectName);
      return true;
    } catch (error) {
      return false;
    }
  }
}
